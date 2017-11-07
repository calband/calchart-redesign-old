"""Tests for models in the base app."""

from base.models import Show, User

from django.test import TestCase


class UserTestCase(TestCase):
    """Test the User model."""

    def test_create_members_only_user(self):
        """Test creating a Members Only user."""
        user = User.objects.create_members_only_user(
            username='foo',
            api_token='asdf',
            ttl_days=10,
        )
        self.assertEqual(user.members_only_username, 'foo')
        self.assertEqual(user.get_username(), 'foo')
        self.assertTrue(user.is_members_only_user())
        self.assertTrue(user.is_valid_api_token())

    def test_create_members_only_user_same_username(self):
        """Test creating with a username shared by a Calchart user."""
        User.objects.create(username='foo')
        user = User.objects.create_members_only_user(
            username='foo',
            api_token='asdf',
            ttl_days=10,
        )
        self.assertEqual(user.members_only_username, 'foo')
        self.assertEqual(user.get_username(), 'foo')
        self.assertTrue(user.is_members_only_user())
        self.assertTrue(user.is_valid_api_token())

    # TODO: test_is_valid_api_token_not_members_only
    # TODO: test_is_valid_api_token_expired
    # TODO: test_has_committee_not_members_only


class ShowTestCase(TestCase):
    """Test the Show model."""

    def test_create_show(self):
        """Test creating a Show."""
        user = User.objects.create(username='foo')
        show = Show.objects.create(name='Foo Bar', owner=user, is_band=True)
        self.assertEqual(show.slug, 'foo-bar')

    # TODO: test_create_same_slug
    # TODO: test_get_data
    # TODO: test_save_data
