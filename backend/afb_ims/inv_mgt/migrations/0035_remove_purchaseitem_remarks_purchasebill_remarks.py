# Generated by Django 4.2.7 on 2023-12-02 07:33

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('inv_mgt', '0034_purchaseitem_remarks'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='purchaseitem',
            name='remarks',
        ),
        migrations.AddField(
            model_name='purchasebill',
            name='remarks',
            field=models.CharField(blank=True, max_length=200, null=True),
        ),
    ]
