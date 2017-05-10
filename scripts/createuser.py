from base.models import User

if not User.objects.exists():
    print('Creating user...')
    user = User.objects.create_user(
        username='member',
        password='calbandgreat',
        email='example@gmail.com',
    )
