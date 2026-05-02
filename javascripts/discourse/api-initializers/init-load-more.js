import { apiInitializer } from "discourse/lib/api";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";

export default apiInitializer("0.11.1", (api) => {
  api.modifyClass("component:load-more", {
    pluginId: "manual-load-more",
    @service currentUser;

    // A getter to cleanly encapsulate the display logic.
    get shouldApplyModification() {
      // Return true if the setting is OFF, or if the user is logged in.
      // Returns false only when the setting is ON and the user is anonymous.
      return !(this.settings.toggle_off_for_anon && !this.currentUser);
    },

    // Teardown logic when the component is destroyed.
    willDestroy() {
      this._super(...arguments);
      this._cleanupBtn();
    },

    // Helper to remove the button and its listeners.
    _cleanupBtn() {
      // The event listener is removed automatically when the element is removed from the DOM.
      this._loadMoreBtn?.remove();
      this._loadMoreBtn = null;
    },

    @action
    onIntersection(entry) {
      if (!(this.args.enabled ?? true)) {
        return;
      }

      // If the modification should not apply, do nothing.
      // This prevents the button from ever being created for this user type.
      if (!this.shouldApplyModification) {
        return;
      }

      const observerEntry = Array.isArray(entry) ? entry[0] : entry;
      const sentinel = observerEntry?.target;
      if (!(sentinel instanceof Element)) {
        return;
      }

      if (observerEntry.isIntersecting) {
        if (this._loadMoreBtn) {
          return;
        }

        const btn = document.createElement("button");
        btn.className = "load-more-btn btn btn-primary";
        // Using siteSettings for translatable text is better practice, but this is fine for now.
        btn.textContent = "Load more";
        btn.addEventListener("click", () => {
          this.args.action();
          // Cleanup is now handled by the helper.
          this._cleanupBtn();
        });

        sentinel.insertAdjacentElement("afterend", btn);
        this._loadMoreBtn = btn;
      } else {
        // Use the consolidated cleanup method.
        this._cleanupBtn();
      }
    },
  });
});
