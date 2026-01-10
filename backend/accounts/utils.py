import secrets

def generate_account_number():
    """
    Generates a secure 12-digit account number
    """
    return ''.join(str(secrets.randbelow(10)) for _ in range(12))
