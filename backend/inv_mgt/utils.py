import datetime

def get_padded_pk(instance, number):
    return str(instance.id).zfill(number)

def year_last_digits():
    current_year = datetime.datetime.now().year
    last_digits = int(str(current_year)[-2:])
    return last_digits