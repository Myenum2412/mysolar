import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    role: str
    is_active: bool
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    full_name: str | None = Field(default=None, max_length=120)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class GoogleRequest(BaseModel):
    id_token: str = Field(min_length=10)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ForgotPasswordResponse(BaseModel):
    detail: str
    reset_url: str | None = None


class ResetPasswordRequest(BaseModel):
    token: str = Field(min_length=10)
    new_password: str = Field(min_length=8, max_length=128)


class OrganizationCreate(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    slug: str | None = Field(default=None, max_length=100)


class OrganizationUpdate(BaseModel):
    name: str = Field(min_length=2, max_length=80)


class OrganizationOut(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    created_by_id: uuid.UUID | None
    created_at: datetime
    member_count: int = 0
    membership_role: str | None = None


class MemberCreate(BaseModel):
    email: EmailStr
    role: Literal["owner", "admin", "member"] = "member"


class MemberOut(BaseModel):
    user_id: uuid.UUID
    email: EmailStr
    full_name: str | None = None
    avatar_url: str | None = None
    role: str
    joined_at: datetime


class MessageResponse(BaseModel):
    detail: str
