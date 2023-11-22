import datetime

def get_padded_pk(instance):
    return str(instance.pk).zfill(4)

def year_last_digits():
    current_year = datetime.datetime.now().year
    last_two_digits = int(str(current_year)[-2:])
    return last_two_digits