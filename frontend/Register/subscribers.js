import { REGISTER_PATH } from '@shopgate/pwa-common/constants/RoutePaths';
import { redirects } from '@shopgate/pwa-common/collections';
import { getCurrentRoute } from '@shopgate/pwa-common/helpers/router';
import { registerRedirect } from '@shopgate/pwa-webcheckout-shopify/action-creators/register';
import { webCheckoutRegisterRedirect$ } from '@shopgate/pwa-webcheckout-shopify/streams';
import { userDidLogin$ } from '@shopgate/pwa-common/streams/user';
import buildRegisterUrl from '@shopgate/pwa-common/subscriptions/helpers/buildRegisterUrl';
import { routeDidEnter$ } from '@shopgate/pwa-common/streams';
import closeInAppBrowser from '@shopgate/pwa-core/commands/closeInAppBrowser';
import broadcastEvent from '@shopgate/pwa-core/commands/broadcastEvent';
import { isAndroid } from '@shopgate/pwa-common/selectors/client';
import { historyPop, historyPush } from '@shopgate/pwa-common/actions/router';
import fetchRegisterUrl from '@shopgate/pwa-common/actions/user/fetchRegisterUrl';
import { getRegisterUrl } from '@shopgate/pwa-common/selectors/user';
import { appWillStart$ } from '@shopgate/pwa-common/streams/app';

/**
 * @param {Object} params The handler parameters.
 * @param {Function} params.dispatch The Redux dispatch function.
 * @param {Function} params.getState The Redux getState function.
 * @return {Promise<string>}
 */
const redirectHandler = async ({ dispatch, getState }) => {
  /**
   * When the register url was opened from a login page, a redirect to the original target
   * page needs to happen after a successful registration. It's added by buildRegisterUrl.
   */
  const { state: { redirect: { location = '' } = {} } } = getCurrentRoute();

  let url = getRegisterUrl(getState());

  if (!url) {
    // Fetch a fresh url if none was found within the store.
    url = await dispatch(fetchRegisterUrl());
  }
  url = buildRegisterUrl(url, location);

  // Dispatch redirect
  dispatch(registerRedirect(url));

  return url;
};

export default (subscribe) => {
  subscribe(appWillStart$, () => {
    redirects.set(REGISTER_PATH, redirectHandler, true);
  });

  const loginAfterRegisterRedirect$ = webCheckoutRegisterRedirect$
    .switchMap(() => userDidLogin$.first());
  const nextRouterAfterLoginRegister$ = loginAfterRegisterRedirect$
    .switchMap(() => routeDidEnter$.first())
    .debounceTime(1000);

  /**
   * Pop a login page after web registration / and redirect to checkout
   */
  subscribe(loginAfterRegisterRedirect$, ({ dispatch, getState }) => {
    const { state: { redirect: { location = '' } = {} } } = getCurrentRoute();
    dispatch(historyPop());

    closeInAppBrowser(isAndroid(getState()));

    if (location) {
      dispatch(historyPush({
        pathname: location,
      }));
    }
  });

  /**
   * Close loading spinner on next after login route
   */
  subscribe(nextRouterAfterLoginRegister$, () => {
    // Close loading view
    broadcastEvent({ event: 'closeNotification' });
  });
};
