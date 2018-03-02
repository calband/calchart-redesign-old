"""Tests for models in the base app."""

from calchart.models import Show, User

from django.test import TestCase


class UserTestCase(TestCase):
    """Test the User model."""

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
