import re
import unicodedata
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..database import get_db
from ..deps import get_current_user, require_admin
from ..models import Membership, Organization, User
from ..schemas import (
    MemberCreate,
    MemberOut,
    MessageResponse,
    OrganizationCreate,
    OrganizationOut,
    OrganizationUpdate,
)

router = APIRouter(prefix="/organizations", tags=["organizations"])


def _slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_value = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_value.lower()).strip("-")
    return slug or "organization"


def _unique_slug(db: Session, base: str) -> str:
    slug = base
    suffix = 2
    while db.scalar(select(Organization.id).where(Organization.slug == slug)):
        slug = f"{base}-{suffix}"
        suffix += 1
    return slug


def _membership(db: Session, org_id: uuid.UUID, user_id: uuid.UUID) -> Membership | None:
    return db.scalar(
        select(Membership).where(
            Membership.organization_id == org_id, Membership.user_id == user_id
        )
    )


def _to_out(db: Session, org: Organization, user: User) -> OrganizationOut:
    member_count = (
        db.scalar(
            select(func.count())
            .select_from(Membership)
            .where(Membership.organization_id == org.id)
        )
        or 0
    )
    membership = _membership(db, org.id, user.id)
    return OrganizationOut(
        id=org.id,
        name=org.name,
        slug=org.slug,
        created_by_id=org.created_by_id,
        created_at=org.created_at,
        member_count=member_count,
        membership_role=membership.role if membership else None,
    )


@router.get("", response_model=list[OrganizationOut])
def list_organizations(
    db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[OrganizationOut]:
    if user.role == "admin":
        organizations = db.scalars(
            select(Organization).order_by(Organization.created_at.desc())
        ).all()
    else:
        organizations = db.scalars(
            select(Organization)
            .join(Membership, Membership.organization_id == Organization.id)
            .where(Membership.user_id == user.id)
            .order_by(Organization.created_at.desc())
        ).all()
    return [_to_out(db, org, user) for org in organizations]


@router.post("", response_model=OrganizationOut, status_code=201)
def create_organization(
    payload: OrganizationCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> OrganizationOut:
    base_slug = _slugify(payload.slug or payload.name)
    org = Organization(
        name=payload.name.strip(),
        slug=_unique_slug(db, base_slug),
        created_by_id=admin.id,
    )
    db.add(org)
    db.flush()
    db.add(Membership(user_id=admin.id, organization_id=org.id, role="owner"))
    db.commit()
    db.refresh(org)
    return _to_out(db, org, admin)


@router.get("/{org_id}", response_model=OrganizationOut)
def get_organization(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> OrganizationOut:
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    if user.role != "admin" and _membership(db, org.id, user.id) is None:
        raise HTTPException(status_code=403, detail="You do not have access.")
    return _to_out(db, org, user)


@router.patch("/{org_id}", response_model=OrganizationOut)
def update_organization(
    org_id: uuid.UUID,
    payload: OrganizationUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> OrganizationOut:
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    org.name = payload.name.strip()
    db.commit()
    db.refresh(org)
    return _to_out(db, org, admin)


@router.delete("/{org_id}", response_model=MessageResponse)
def delete_organization(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> MessageResponse:
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    db.delete(org)
    db.commit()
    return MessageResponse(detail="Organization deleted.")


@router.get("/{org_id}/members", response_model=list[MemberOut])
def list_members(
    org_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[MemberOut]:
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")
    if user.role != "admin" and _membership(db, org.id, user.id) is None:
        raise HTTPException(status_code=403, detail="You do not have access.")

    rows = db.execute(
        select(Membership, User)
        .join(User, User.id == Membership.user_id)
        .where(Membership.organization_id == org.id)
        .order_by(Membership.joined_at.asc())
    ).all()
    return [
        MemberOut(
            user_id=member_user.id,
            email=member_user.email,
            full_name=member_user.full_name,
            avatar_url=member_user.avatar_url,
            role=membership.role,
            joined_at=membership.joined_at,
        )
        for membership, member_user in rows
    ]


@router.post("/{org_id}/members", response_model=MemberOut, status_code=201)
def add_member(
    org_id: uuid.UUID,
    payload: MemberCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> MemberOut:
    org = db.get(Organization, org_id)
    if org is None:
        raise HTTPException(status_code=404, detail="Organization not found.")

    member_user = db.scalar(
        select(User).where(User.email == payload.email.lower())
    )
    if member_user is None:
        raise HTTPException(
            status_code=404,
            detail="No user with that email. Ask them to sign up first.",
        )
    if _membership(db, org.id, member_user.id) is not None:
        raise HTTPException(
            status_code=409, detail="That user is already a member."
        )

    membership = Membership(
        user_id=member_user.id,
        organization_id=org.id,
        role=payload.role,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return MemberOut(
        user_id=member_user.id,
        email=member_user.email,
        full_name=member_user.full_name,
        avatar_url=member_user.avatar_url,
        role=membership.role,
        joined_at=membership.joined_at,
    )


@router.delete("/{org_id}/members/{user_id}", response_model=MessageResponse)
def remove_member(
    org_id: uuid.UUID,
    user_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
) -> MessageResponse:
    membership = _membership(db, org_id, user_id)
    if membership is None:
        raise HTTPException(status_code=404, detail="Membership not found.")
    db.delete(membership)
    db.commit()
    return MessageResponse(detail="Member removed.")
