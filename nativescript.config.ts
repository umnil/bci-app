import { NativeScriptConfig } from '@nativescript/core'

export default {
  id: 'edu.miami.prasad.bmimobile',
  appResourcesPath: 'app/App_Resources',
  android: {
    v8Flags: '--expose_gc',
    markingMode: 'none',
  },
  appPath: 'app',
} as NativeScriptConfig
