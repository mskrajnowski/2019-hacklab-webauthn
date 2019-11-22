import string
import random


def generate_challenge(length=32):
    return "".join(random.choice(string.ascii_letters) for i in range(length))
