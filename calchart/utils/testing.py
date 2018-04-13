"""Utilities for testing."""

import json
from unittest import mock

from calchart.models import User
from calchart.views import CalchartView

from django.test import RequestFactory as DjangoRequestFactory, TestCase


def get_user():
    """Get a superuser for testing."""
    # use superuser to avoid API call to check-committee
    superuser = User.objects.filter(is_superuser=True)
    if superuser.exists():
        return superuser.get()
    else:
        return User.objects.create_superuser(
            username='foo',
            password='foo',
            email='',
        )


class _RequestFactory(object):
    """A new RequestFactory that augments Django's built-in RequestFactory."""

    _factory = DjangoRequestFactory()

    def GET(self, data=None):
        if data is None:
            data = {}

        request = self._factory.get('/', data)
        request.user = get_user()
        return request

    def POST(self, data=None):
        if data is None:
            data = {}

        request = self._factory.post('/', data)
        request.user = get_user()
        return request


RequestFactory = _RequestFactory()


class ActionsTestCase(TestCase):
    """A TestCase for testing POST actions."""

    def do_action(self, action, data, *, raw=False, **kwargs):
        """Run the given action and return the data sent back."""
        request = RequestFactory.POST({
            'action': action,
            'data': json.dumps(data),
        }, **kwargs)
        response = CalchartView.as_view()(request)
        if raw:
            return response
        else:
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
