# Generated by Django 4.2.7 on 2023-11-23 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0003_stock_code_counter'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='code',
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]