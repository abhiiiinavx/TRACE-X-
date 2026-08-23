import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
)
from sqlalchemy.orm import relationship
from backend.app.db.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="analyst")  # admin, investigator, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)

class ForensicCase(Base):
    __tablename__ = "forensic_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    severity = Column(String(50), default="MEDIUM")  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    status = Column(String(50), default="Open")  # Open, Investigating, Contained, Resolved, Archived
    investigator_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    investigator_name = Column(String(255), nullable=True)
    action_items = Column(JSON, default=list)  # list of action checklist items
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    emails = relationship("Email", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="case", cascade="all, delete-orphan")
    timeline_events = relationship("TimelineEvent", back_populates="case", cascade="all, delete-orphan")

class Email(Base):
    __tablename__ = "emails"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("forensic_cases.id"), nullable=True)
    from_addr = Column(String(255), index=True, nullable=False)
    from_display_name = Column(String(255), nullable=True)
    to_addr = Column(String(255), index=True, nullable=False)
    reply_to = Column(String(255), nullable=True)
    return_path = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=True)
    message_id = Column(String(255), index=True, nullable=True)
    date_header = Column(String(255), nullable=True)
    raw_eml_path = Column(String(500), nullable=True)
    sha256 = Column(String(64), index=True, nullable=False)
    
    # Verdict & Scoring
    risk_score = Column(Integer, default=0, index=True)  # 0 to 100
    severity = Column(String(50), default="CLEAN", index=True)  # CRITICAL, HIGH, MEDIUM, LOW, CLEAN
    classification = Column(String(100), default="Legitimate")  # Credential Phishing, BEC / CEO Fraud, Malware Delivery, etc.
    explanation_summary = Column(Text, nullable=True)
    feature_breakdown = Column(JSON, default=list)  # list of {feature, evidence, impact, confidence}
    mitre_techniques = Column(JSON, default=list)  # list of {id, name, description}
    
    # Extracted data
    body_plain = Column(Text, nullable=True)
    body_html_sanitized = Column(Text, nullable=True)
    auth_results = Column(JSON, default=dict)  # spf, dkim, dmarc, arc, return_path_alignment
    nlp_signals = Column(JSON, default=dict)  # urgency, financial, credential, executive, sentiment
    score_calculation_breakdown = Column(JSON, default=dict)
    
    uploaded_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    case = relationship("ForensicCase", back_populates="emails")
    headers = relationship("EmailHeader", back_populates="email", cascade="all, delete-orphan")
    urls = relationship("EmailUrl", back_populates="email", cascade="all, delete-orphan")
    attachments = relationship("Attachment", back_populates="email", cascade="all, delete-orphan")
    campaign_memberships = relationship("CampaignMember", back_populates="email", cascade="all, delete-orphan")

class EmailHeader(Base):
    __tablename__ = "email_headers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=False)
    header_name = Column(String(255), nullable=False)
    header_value = Column(Text, nullable=False)
    hop_index = Column(Integer, nullable=True)  # For Received headers

    email = relationship("Email", back_populates="headers")

class EmailUrl(Base):
    __tablename__ = "email_urls"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=False)
    original_url = Column(Text, nullable=False)
    final_url = Column(Text, nullable=True)
    redirect_chain = Column(JSON, default=list)  # List of URLs in hop order
    domain = Column(String(255), index=True, nullable=True)
    resolved_ip = Column(String(100), index=True, nullable=True)
    is_https = Column(Boolean, default=False)
    risk_score = Column(Integer, default=0)
    is_credential_harvester = Column(Boolean, default=False)
    suspicious_reasons = Column(JSON, default=list)

    email = relationship("Email", back_populates="urls")

class Domain(Base):
    __tablename__ = "domains"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    domain = Column(String(255), unique=True, index=True, nullable=False)
    registrar = Column(String(255), nullable=True)
    created_date = Column(String(100), nullable=True)
    expiry_date = Column(String(100), nullable=True)
    nameservers = Column(JSON, default=list)
    mx_records = Column(JSON, default=list)
    a_records = Column(JSON, default=list)
    age_days = Column(Integer, default=0)
    brand_similarity_score = Column(Float, default=0.0)
    is_lookalike = Column(Boolean, default=False)
    impersonated_brand = Column(String(100), nullable=True)
    lookalike_technique = Column(String(100), nullable=True)  # homoglyph, hyphenation, tld_swap
    reputation_score = Column(Integer, default=50)  # 0 (malicious) to 100 (trusted)
    risk_score = Column(Integer, default=0)
    reason_summary = Column(Text, nullable=True)
    last_analyzed = Column(DateTime, default=datetime.utcnow)

class IP(Base):
    __tablename__ = "ips"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ip = Column(String(100), unique=True, index=True, nullable=False)
    country = Column(String(100), nullable=True)
    country_code = Column(String(10), nullable=True)
    region = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    isp = Column(String(255), nullable=True)
    asn = Column(String(100), nullable=True)
    asn_org = Column(String(255), nullable=True)
    hosting_provider = Column(String(255), nullable=True)
    is_vpn_proxy_tor = Column(Boolean, default=False)
    node_type = Column(String(50), default="Public Host")  # Tor Exit, VPN, Hosting Provider, Residential
    attribution_confidence = Column(Integer, default=70)  # Always explicit %
    attribution_notes = Column(String(255), default="Probable infrastructure location based on BGP routing and ASN registry.")
    reputation_score = Column(Integer, default=50)
    risk_score = Column(Integer, default=0)
    last_analyzed = Column(DateTime, default=datetime.utcnow)

class Attachment(Base):
    __tablename__ = "attachments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size_bytes = Column(Integer, default=0)
    sha256 = Column(String(64), index=True, nullable=False)
    is_malicious = Column(Boolean, default=False)
    threat_name = Column(String(255), nullable=True)
    extracted_features = Column(JSON, default=dict)

    email = relationship("Email", back_populates="attachments")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    confidence = Column(Integer, default=85)  # 0 to 100%
    email_count = Column(Integer, default=0)
    domain_count = Column(Integer, default=0)
    ip_count = Column(Integer, default=0)
    asn_count = Column(Integer, default=0)
    country_count = Column(Integer, default=0)
    primary_threat_type = Column(String(100), default="Credential Phishing")
    shared_signatures = Column(JSON, default=dict)  # shared domains, IPs, ASNs, URL patterns, hash
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    members = relationship("CampaignMember", back_populates="campaign", cascade="all, delete-orphan")

class CampaignMember(Base):
    __tablename__ = "campaign_members"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    campaign_id = Column(String(36), ForeignKey("campaigns.id"), nullable=False)
    email_id = Column(String(36), ForeignKey("emails.id"), nullable=False)
    similarity_score = Column(Float, default=0.9)
    shared_signals = Column(JSON, default=list)

    campaign = relationship("Campaign", back_populates="members")
    email = relationship("Email", back_populates="campaign_memberships")

class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_type = Column(String(50), nullable=False)  # Email, Domain, IP, ASN, Campaign, URL
    source_id = Column(String(100), nullable=False, index=True)
    target_type = Column(String(50), nullable=False)
    target_id = Column(String(100), nullable=False, index=True)
    relationship_type = Column(String(100), nullable=False)  # ORIGINATED_FROM, CONTAINS_URL, RESOLVES_TO, HOSTED_ON, BELONGS_TO
    weight = Column(Float, default=1.0)
    metadata_json = Column(JSON, default=dict)

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("forensic_cases.id"), nullable=False)
    email_id = Column(String(36), nullable=True)
    evidence_type = Column(String(100), nullable=False)  # Raw EML, Email Header, Malicious URL, Domain Record, IP Geolocation, Attachment Hash
    source = Column(String(255), nullable=False)
    sha256 = Column(String(64), index=True, nullable=False)
    collected_by = Column(String(255), default="TRACE-X Ingestion Agent")
    is_immutable = Column(Boolean, default=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow)

    case = relationship("ForensicCase", back_populates="evidence_items")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("forensic_cases.id"), nullable=False)
    email_id = Column(String(36), nullable=True)
    event_type = Column(String(100), nullable=False)  # MessageSent, RelayHop, AuthEvaluated, URLResolved, RedirectHop, CredentialHarvesterLoaded, AlertTriggered
    description = Column(Text, nullable=False)
    occurred_at = Column(String(100), nullable=True)
    evidence_ref = Column(String(100), nullable=True)
    severity = Column(String(50), default="INFO")

    case = relationship("ForensicCase", back_populates="timeline_events")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    username = Column(String(100), default="System")
    action = Column(String(100), nullable=False)  # LOGIN, UPLOAD_EML, RUN_ANALYSIS, UPDATE_CASE, EXPORT_REPORT, COPILOT_QUERY
    target_type = Column(String(50), nullable=True)
    target_id = Column(String(100), nullable=True)
    details = Column(JSON, default=dict)
    ip_addr = Column(String(100), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
