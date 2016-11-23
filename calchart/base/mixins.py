from django.core.urlresolvers import reverse
from django.shortcuts import redirect

class LoginRequiredMixin(object):
    """
    Checks that a user is logged in.
    """
    def dispatch(self, request, *args, **kwargs):
        if not request.session.get('valid'):
            url = reverse('login')
            return redirect('%s?next=%s' % (url, request.path))
        else:
            return super(LoginRequiredMixin, self).dispatch(request, *args, **kwargs)
