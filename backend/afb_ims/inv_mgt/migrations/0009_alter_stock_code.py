# Generated by Django 4.2.7 on 2023-11-23 13:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0008_alter_stock_code'),
    ]

    operations = [
        migrations.AlterField(
            model_name='stock',
            name='code',
            field=models.CharField(max_length=100, unique=True),
        ),
    ]
