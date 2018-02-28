from calchart.models import User

if not User.objects.exists():
    print('Creating user...')
    user = User.objects.create_superuser(
        username='member',
        password='calbandgreat',
        email='example@gmail.com',
    )
