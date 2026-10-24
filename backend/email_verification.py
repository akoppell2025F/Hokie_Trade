"""Email verification for Hokie Trade.

Sends a 6-digit verification code to a student's @vt.edu address over SMTP.

SMTP settings are read from environment variables so no credentials live in
the repo:

    SMTP_HOST      e.g. smtp.gmail.com
    SMTP_PORT      e.g. 587 (STARTTLS) -- defaults to 587
    SMTP_USERNAME  login for the mail account
    SMTP_PASSWORD  password / app password for the mail account
    SMTP_SENDER    "From" address -- defaults to SMTP_USERNAME
"""

from __future__ import annotations

import os
import secrets
import smtplib
from dataclasses import dataclass
from email.message import EmailMessage

VT_DOMAIN = "@vt.edu"
CODE_LENGTH = 6


class InvalidEmailError(ValueError):
    """Raised when an address is not a valid @vt.edu email."""


class EmailSendError(RuntimeError):
    """Raised when the SMTP server fails to send the message."""


@dataclass(frozen=True)
class SmtpConfig:
    host: str
    port: int
    username: str
    password: str
    sender: str

    @classmethod
    def from_env(cls) -> "SmtpConfig":
        try:
            host = os.environ["SMTP_HOST"]
            username = os.environ["SMTP_USERNAME"]
            password = os.environ["SMTP_PASSWORD"]
        except KeyError as missing:
            raise EmailSendError(f"Missing SMTP setting: {missing.args[0]}") from None
        return cls(
            host=host,
            port=int(os.environ.get("SMTP_PORT", "587")),
            username=username,
            password=password,
            sender=os.environ.get("SMTP_SENDER", username),
        )


def normalize_vt_email(email: str) -> str:
    """Trim and lowercase an email, and make sure it is a @vt.edu address."""
    cleaned = (email or "").strip().lower()
    local_part = cleaned[: -len(VT_DOMAIN)]
    if not cleaned.endswith(VT_DOMAIN) or not local_part or "@" in local_part:
        raise InvalidEmailError("Enter a VT email ending in @vt.edu to get a code.")
    return cleaned


def generate_verification_code(length: int = CODE_LENGTH) -> str:
    """Return a random numeric code (e.g. '048213'), using a secure RNG."""
    return "".join(secrets.choice("0123456789") for _ in range(length))


def build_verification_email(to_address: str, code: str, sender: str) -> EmailMessage:
    """Build the verification email message (does not send it)."""
    msg = EmailMessage()
    msg["Subject"] = "Your Hokie Trade verification code"
    msg["From"] = sender
    msg["To"] = to_address
    msg.set_content(
        f"Hi Hokie!\n\n"
        f"Your Hokie Trade verification code is: {code}\n\n"
        f"Enter this code in the app to finish signing in. "
        f"If you didn't request this, you can ignore this email.\n"
    )
    return msg


def send_verification_email(
    to_address: str,
    code: str | None = None,
    config: SmtpConfig | None = None,
) -> str:
    """Send a verification code to a @vt.edu address.

    Args:
        to_address: the student's email; must end in @vt.edu.
        code: the code to send. If omitted, a new 6-digit code is generated.
        config: SMTP settings. If omitted, they are read from the environment.

    Returns:
        The code that was sent, so the caller can store it and check it later.

    Raises:
        InvalidEmailError: the address is not a @vt.edu email.
        EmailSendError: SMTP settings are missing or the server rejected it.
    """
    to_address = normalize_vt_email(to_address)
    code = code or generate_verification_code()
    config = config or SmtpConfig.from_env()

    msg = build_verification_email(to_address, code, config.sender)

    try:
        with smtplib.SMTP(config.host, config.port, timeout=10) as server:
            server.starttls()
            server.login(config.username, config.password)
            server.send_message(msg)
    except (smtplib.SMTPException, OSError) as exc:
        raise EmailSendError(f"Could not send verification email: {exc}") from exc

    return code