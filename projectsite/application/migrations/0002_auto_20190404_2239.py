# Generated by Django 2.0.2 on 2019-04-04 22:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('application', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Twitter',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('geo', models.CharField(max_length=200)),
                ('coordinate', models.CharField(max_length=200)),
                ('geotype', models.CharField(max_length=200)),
                ('tweet', models.CharField(max_length=280)),
                ('user_id', models.IntegerField()),
                ('tag', models.CharField(max_length=200)),
            ],
        ),
        migrations.RemoveField(
            model_name='choice',
            name='question',
        ),
        migrations.DeleteModel(
            name='Choice',
        ),
        migrations.DeleteModel(
            name='Question',
        ),
    ]