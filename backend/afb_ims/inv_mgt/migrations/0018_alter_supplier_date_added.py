# Generated by Django 4.2.7 on 2023-11-26 04:44

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0017_alter_supplier_email_alter_supplier_phone'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supplier',
            name='date_added',
            field=models.DateTimeField(default=django.utils.timezone.now),
        ),
    ]
