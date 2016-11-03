import * as React from 'react';

import { ViewMapper } from '../RouteHandler/RouteHandlerView';
import { Splash } from '../Splash/Splash';

export const ViewMap = {
  Splash: () => <Splash header='WebRx.React' />,
} as ViewMapper;
