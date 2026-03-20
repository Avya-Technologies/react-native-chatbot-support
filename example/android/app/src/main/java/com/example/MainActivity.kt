package com.example

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "example"

  /**
   * Use the classic ReactActivityDelegate to avoid New Architecture initialization.
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      ReactActivityDelegate(this, mainComponentName)
}
