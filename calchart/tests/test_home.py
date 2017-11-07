from django.test import TestCase

from base.models import Show
from base.views import CalchartView
from utils.testing import ActionsTestCase, RequestFactory


class TabsTestCase(TestCase):
    """Test retrieving tabs for the home page."""

    def test_get_tabs_members_only_user(self):
        request = RequestFactory.GET(members_only=True)
        response = CalchartView.as_view()(request)

        tabs = response.context_data['tabs']
        self.assertEqual(len(tabs), 2)
        self.assertEqual(tabs[0][0], 'band')

    # TODO: test get_tabs not members_only_user
    # TODO: test get_tab band members_only_user
    # TODO: test get_tab band not members_only_user
    # TODO: test get_tab owned


class CreateShowTestCase(ActionsTestCase):
    """Test the create_show action."""

    def assertCreateShow(self, is_band, members_only, final_is_band):
        response = self.do_action('create_show', {
            'name': 'Foo',
            'isBand': is_band,
        }, members_only=members_only)

        self.assertTrue(Show.objects.filter(name='Foo').exists())
        show = Show.objects.get(name='Foo')
        self.assertEqual(show.is_band, final_is_band)
        self.assertEqual(response.get('slug'), 'foo')

    def test_create_show_band_members_only(self):
        self.assertCreateShow(True, True, True)

    def test_create_show_band_calchart(self):
        # if Calchart-only user, Show should never be is_band
        self.assertCreateShow(True, False, False)

    def test_create_show_not_band_members_only(self):
        self.assertCreateShow(False, True, False)

    def test_create_show_not_band_calchart(self):
        self.assertCreateShow(False, False, False)

    # TODO: test create Show twice errors


class PublishShowTestCase(ActionsTestCase):
    """Test the publish_show action."""

    # TODO: test publish initialized show
    # TODO: test unpublish initialized show
    # TODO: test publish un-initialized show
    # TODO: test unpublish un-initialized show
