"""Utilities for testing."""

from django.test import TestCase, RequestFactory as DjangoRequestFactory

import json
from unittest import mock

from base.models import User
from base.views import CalchartView


class _RequestFactory(object):
    """A new RequestFactory that augments Django's built-in RequestFactory."""

    _factory = DjangoRequestFactory()

    def get_user(self, members_only):
        """Get a Members Only or Calchart-only user for a request."""
        if members_only:
            # use superuser to avoid API call to check-committee
            return User.objects.create_superuser(
                username='foo',
                password='foo',
                email='',
            )
        else:
            return User.objects.create(username='bar')

    def GET(self, data=None, members_only=False):
        if data is None:
            data = {}

        request = self._factory.get('/', data)
        request.user = self.get_user(members_only=members_only)
        return request

    def POST(self, data=None, members_only=False):
        if data is None:
            data = {}

        request = self._factory.post('/', data)
        request.user = self.get_user(members_only=members_only)
        return request

RequestFactory = _RequestFactory()


class ActionsTestCase(TestCase):
    """A TestCase for testing POST actions."""

    def do_action(self, action, data, **kwargs):
        """Run the given action and return the data sent back."""
        request = RequestFactory.POST({
            'action': action,
            'data': json.dumps(data),
        }, **kwargs)
        response = CalchartView.as_view()(request)
        self.assertEqual(response.status_code, 200)
        return json.loads(response.content)


def mock_endpoint(endpoint, data):
    """
    Mock any calls to utils.api.call_endpoint, returning the given data.

    Usage:
    with mock_endpoint('check_committee', { 'has_committee': True }):
        response = call_endpoint('check_comittee', user)
        self.assertTrue(response['has_committee'])
    """
    def mock_call(url, *args, **kwargs):
        response = mock.MagicMock()
        if url.split('/')[-2] == endpoint:
            response.json.return_value = data
        else:
            response.json.return_value = None
        return response

    mocked_requests = mock.MagicMock()
    mocked_requests.get = mocked_requests.post = mock_call
    return mock.patch('utils.api.requests', new=mocked_requests)
