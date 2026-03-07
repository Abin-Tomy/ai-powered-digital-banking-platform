"""
Custom encrypted model field using Fernet symmetric encryption.
Used for PCI-DSS compliant storage of sensitive card data.
"""
import base64
from django.conf import settings
from django.db import models
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def _get_fernet():
    """Derive a Fernet key from Django's SECRET_KEY."""
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b"credit-card-encryption-salt",
        iterations=100_000,
    )
    key = base64.urlsafe_b64encode(
        kdf.derive(settings.SECRET_KEY.encode())
    )
    return Fernet(key)


class EncryptedCharField(models.CharField):
    """
    A CharField that transparently encrypts/decrypts its value
    using Fernet (AES-128-CBC) derived from Django's SECRET_KEY.
    """

    def get_prep_value(self, value):
        """Encrypt before saving to the database."""
        if value is None or value == "":
            return value
        f = _get_fernet()
        return f.encrypt(value.encode()).decode()

    def from_db_value(self, value, expression, connection):
        """Decrypt when reading from the database."""
        if value is None or value == "":
            return value
        try:
            f = _get_fernet()
            return f.decrypt(value.encode()).decode()
        except Exception:
            # Return raw value if decryption fails (e.g. legacy unencrypted data)
            return value

    def get_internal_type(self):
        # Store as TextField to accommodate the longer encrypted ciphertext
        return "TextField"
