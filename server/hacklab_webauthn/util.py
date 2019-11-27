import string
import random


def random_string(length=32):
    return "".join(
        random.choice(string.ascii_letters + string.digits)
        for i in range(length)
    )
