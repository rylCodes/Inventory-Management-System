# Generated by Django 3.2.23 on 2023-11-21 08:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0025_auto_20231121_1446'),
    ]

    operations = [
        migrations.RenameField(
            model_name='salesitem',
            old_name='quantity_sold',
            new_name='quantity',
        ),
    ]
