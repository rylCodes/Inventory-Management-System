# Generated by Django 4.2.7 on 2023-12-15 11:06

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0046_alter_supplier_address'),
    ]

    operations = [
        migrations.AlterField(
            model_name='salesitem',
            name='menu',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='inv_mgt.menu'),
        ),
    ]
