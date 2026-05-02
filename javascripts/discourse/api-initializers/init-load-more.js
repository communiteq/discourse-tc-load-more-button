import { apiInitializer } from 'discourse/lib/api';
import { action } from "@ember/object";

export default apiInitializer('0.11.1', (api) => {

  api.modifyClass("component:load-more", {
    pluginId: "manual-load-more",

    @action
    onIntersection(entry) {
      if (!(this.args.enabled ?? true)) {
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
        btn.textContent = "Load more";
        btn.addEventListener("click", () => {
          btn.remove();
          this._loadMoreBtn = null;
          this.args.action();
        });

        if (sentinel.parentElement) {
          sentinel.insertAdjacentElement("afterend", btn);
        } else {
          return;
        }

        this._loadMoreBtn = btn;
      } else {
        this._loadMoreBtn?.remove();
        this._loadMoreBtn = null;
      }
    },
  });
});
