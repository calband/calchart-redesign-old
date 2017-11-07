"""Tests for models in the base app."""

from base.models import Show, User

from django.test import TestCase


class UserTestCase(TestCase):
    """Test the User model."""

    # TODO: test_create_members_only
    # TODO: test_create_members_only_same_username
    # TODO: test_is_valid_api_token


class ShowTestCase(TestCase):
    """Test the Show model."""

    # TODO: test_create
    # TODO: test_create_same_slug
    # TODO: test_get_data
    # TODO: test_save_data
