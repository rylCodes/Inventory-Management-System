# Generated by Django 4.2.7 on 2023-12-01 10:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0031_rename_product_id_salesitem_menu'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salesbill',
            name='remarks',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
