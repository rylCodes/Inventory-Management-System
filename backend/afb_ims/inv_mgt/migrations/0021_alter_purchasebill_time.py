# Generated by Django 4.2.7 on 2023-11-26 08:01

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0020_alter_supplier_email_alter_supplier_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='purchasebill',
            name='time',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
