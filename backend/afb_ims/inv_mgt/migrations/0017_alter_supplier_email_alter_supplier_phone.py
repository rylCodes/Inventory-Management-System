# Generated by Django 4.2.7 on 2023-11-26 04:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0016_alter_supplier_address_alter_supplier_date_added_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='supplier',
            name='email',
            field=models.EmailField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='supplier',
            name='phone',
            field=models.CharField(blank=True, max_length=15),
        ),
    ]