# Generated by Django 3.2.23 on 2023-12-11 06:26

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0044_stock_show_notification'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='menu',
            options={'ordering': ['-date_added']},
        ),
        migrations.AlterModelOptions(
            name='stock',
            options={'ordering': ['-date_added']},
        ),
        migrations.AlterModelOptions(
            name='supplier',
            options={'ordering': ['-date_added']},
        ),
    ]