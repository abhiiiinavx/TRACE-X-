from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.db.models import User, AuditLog
from backend.app.db.schemas import Token, UserLogin, UserCreate, UserResponse
from backend.app.core.security import create_access_token, verify_password, get_password_hash
from backend.app.core.deps import get_current_user

router = APIRouter()

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        # Demo friendly: If demo accounts, create if missing
        if login_data.email in ["admin@tracex.forensics", "investigator@tracex.forensics", "analyst@tracex.forensics"]:
            role = "admin" if "admin" in login_data.email else ("investigator" if "investigator" in login_data.email else "analyst")
            user = User(
                email=login_data.email,
                password_hash=get_password_hash(login_data.password),
                full_name="Lead Cyber Investigator",
                role=role
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

    token = create_access_token(subject=user.id, role=user.role)
    
    # Audit log
    audit = AuditLog(
        user_id=user.id,
        username=user.full_name or user.email,
        action="LOGIN",
        target_type="User",
        target_id=user.id,
        details={"email": user.email, "role": user.role}
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role,
        "user_id": user.id,
        "email": user.email,
        "full_name": user.full_name
    }

@router.post("/register", response_model=UserResponse)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already registered with this email")
    
    new_user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name or user_data.email.split("@")[0].capitalize(),
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
