# Generated by Django 3.2.23 on 2023-11-17 08:51

import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0013_alter_salesitem_quantity_sold'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salesitem',
            name='sub_total',
            field=models.FloatField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(0)]),
        ),
    ]
