import smtplib

import pytest

from email_verification import (
    EmailSendError,
    InvalidEmailError,
    SmtpConfig,
    build_verification_email,
    generate_verification_code,
    normalize_vt_email,
    send_verification_email,
)


# ---------- email validation ----------

@pytest.mark.parametrize("raw, expected", [
    ("hokie@vt.edu", "hokie@vt.edu"),
    ("  Hokie@VT.EDU ", "hokie@vt.edu"),
])
def test_normalize_accepts_vt_emails(raw, expected):
    assert normalize_vt_email(raw) == expected


@pytest.mark.parametrize("bad", [
    "", "   ", "hokie@gmail.com", "hokie@vt.edu.evil.com",
    "@vt.edu", "a@b@vt.edu", "hokievt.edu",
])
def test_normalize_rejects_non_vt_emails(bad):
    with pytest.raises(InvalidEmailError):
        normalize_vt_email(bad)


# ---------- code generation ----------

def test_code_is_six_digits():
    code = generate_verification_code()
    assert len(code) == 6 and code.isdigit()


def test_codes_are_random():
    assert len({generate_verification_code() for _ in range(50)}) > 1


# ---------- message contents ----------

def test_build_email_headers_and_body():
    msg = build_verification_email("hokie@vt.edu", "123456", "noreply@test.local")
    assert msg["To"] == "hokie@vt.edu"
    assert msg["From"] == "noreply@test.local"
    assert "verification code" in msg["Subject"].lower()
    assert "123456" in msg.get_content()


# ---------- sending ----------

def test_send_uses_smtp_correctly(fake_smtp, smtp_config):
    code = send_verification_email("Hokie@VT.edu", code="654321", config=smtp_config)

    assert code == "654321"
    fake_smtp.factory.assert_called_once_with("smtp.test.local", 587, timeout=10)
    fake_smtp.starttls.assert_called_once()
    fake_smtp.login.assert_called_once_with("hokietrade@test.local", "not-a-real-password")
    fake_smtp.send_message.assert_called_once()

    sent = fake_smtp.send_message.call_args.args[0]
    assert sent["To"] == "hokie@vt.edu"
    assert "654321" in sent.get_content()


def test_send_generates_code_when_none_given(fake_smtp, smtp_config):
    code = send_verification_email("hokie@vt.edu", config=smtp_config)
    assert len(code) == 6 and code.isdigit()
    assert code in fake_smtp.send_message.call_args.args[0].get_content()


def test_invalid_email_never_contacts_server(fake_smtp, smtp_config):
    with pytest.raises(InvalidEmailError):
        send_verification_email("hokie@gmail.com", config=smtp_config)
    fake_smtp.factory.assert_not_called()


def test_smtp_failure_raises_email_send_error(fake_smtp, smtp_config):
    fake_smtp.login.side_effect = smtplib.SMTPAuthenticationError(535, b"bad creds")
    with pytest.raises(EmailSendError):
        send_verification_email("hokie@vt.edu", config=smtp_config)


def test_connection_failure_raises_email_send_error(fake_smtp, smtp_config):
    fake_smtp.factory.side_effect = ConnectionRefusedError("no server")
    with pytest.raises(EmailSendError):
        send_verification_email("hokie@vt.edu", config=smtp_config)


# ---------- config from environment ----------

def test_config_from_env(monkeypatch, fake_smtp):
    monkeypatch.setenv("SMTP_HOST", "smtp.env.local")
    monkeypatch.setenv("SMTP_PORT", "2525")
    monkeypatch.setenv("SMTP_USERNAME", "user@env.local")
    monkeypatch.setenv("SMTP_PASSWORD", "pw")
    monkeypatch.delenv("SMTP_SENDER", raising=False)

    send_verification_email("hokie@vt.edu")

    fake_smtp.factory.assert_called_once_with("smtp.env.local", 2525, timeout=10)
    assert fake_smtp.send_message.call_args.args[0]["From"] == "user@env.local"


def test_missing_env_raises(monkeypatch):
    for var in ("SMTP_HOST", "SMTP_USERNAME", "SMTP_PASSWORD"):
        monkeypatch.delenv(var, raising=False)
    with pytest.raises(EmailSendError, match="SMTP_HOST"):
        SmtpConfig.from_env()