"""Tests for POST actions."""

import json

from calchart.models import Show
from utils.testing import ActionsTestCase, get_user


class CreateShowTestCase(ActionsTestCase):
    """Test the create_show action."""

    SHOW_DATA = {
        'slug': '',  # empty when sent from form; check slug is properly set
        'name': 'Foo',
        'isBand': False,
        'numDots': 10,
        'dotGroups': {},
        'labelFormat': 'combo',
        'audioUrl': None,
        'songs': [],
        'fieldType': 'college',
        'beatsPerStep': [1, 1],
        'stepType': 'high_step',
        'orientation': 'east',
    }

    def test_create_show(self):
        """Test the create_show endpoint."""
        data = self.SHOW_DATA.copy()

        result = self.do_action('create_show', data)
        slug = result['slug']
        show = Show.objects.filter(slug=slug)
        self.assertTrue(show.exists())
        show = show.get()

        self.assertNotEqual(slug, '')  # slug should have been replaced
        self.assertEqual(show.slug, slug)
        self.assertEqual(show.name, data['name'])
        self.assertEqual(show.is_band, data['isBand'])
        self.assertEqual(show.owner, get_user())

        data['slug'] = slug
        data['published'] = False
        self.assertEqual(show.get_data(), data)

    def test_create_show_twice(self):
        """Test that a show cannot be created twice."""
        self.do_action('create_show', self.SHOW_DATA)
        response = self.do_action('create_show', self.SHOW_DATA, raw=True)
        self.assertEqual(response.status_code, 500)

        name = self.SHOW_DATA['name']
        msg = f'Show with the name `{name}` already exists.'
        self.assertEqual(json.loads(response.content)['message'], msg)

    # TODO: test create Show is_band, Stunt
    # TODO: test create Show is_band, non-Stunt
    # TODO: test create Show not is_band, Stunt
    # TODO: test create Show not is_band, non-Stunt


class PublishShowTestCase(ActionsTestCase):
    """Test the publish_show action."""

    # TODO: test publish initialized show
    # TODO: test unpublish initialized show
    # TODO: test publish un-initialized show
    # TODO: test unpublish un-initialized show
