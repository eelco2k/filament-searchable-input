function c({ key: e, statePath: n, tableMode: h = !1, columns: l = [], perPage: s = 10, wire: i, initialValue: t, displayValueKey: a = "value" }) {
  return h ? g({ key: e, statePath: n, columns: l, perPage: s, wire: i, displayValueKey: a }) : r({ key: e, statePath: n, wire: i, displayValueKey: a });
}
function u(e, n = "value") {
  if (e == null)
    return "";
  if (typeof e == "string")
    return e;
  if (typeof e == "number")
    return String(e);
  if (typeof e == "object") {
    if (e[n] !== void 0)
      return String(e[n]);
    if (e.value !== void 0)
      return String(e.value);
    if (e.label !== void 0)
      return String(e.label);
  }
  return "";
}
function r({ key: e, statePath: n, wire: h, displayValueKey: l }) {
  return {
    previous_value: null,
    suggestions: [],
    selected_suggestion: 0,
    // Use entanglement for proper Livewire sync
    init() {
      this._entangled = h.entangle(n);
      const s = u(this._entangled, l);
      this.value = s, this.previous_value = s, this.$watch("_entangled", (i) => {
        this.value = u(i, l);
      });
    },
    get value() {
      return this._displayValue ?? "";
    },
    set value(s) {
      this._displayValue = s;
    },
    refresh_suggestions() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.suggestions = [], this.previous_value = null;
          return;
        }
        this.previous_value = this.value, h.callSchemaComponentMethod(e, "getSearchResultsForJs", { search: this.value }).then((s) => {
          this.suggestions = s, this.selected_suggestion = 0;
        });
      }
    },
    set(s) {
      if (s === void 0)
        return;
      const i = u(s, l);
      this.value = i, this._entangled = i, this.suggestions = [], h.callSchemaComponentMethod(e, "reactOnItemSelectedFromJs", { item: s });
    },
    previous_suggestion() {
      this.selected_suggestion--, this.selected_suggestion < 0 && (this.selected_suggestion = 0);
    },
    next_suggestion() {
      this.selected_suggestion++, this.selected_suggestion > this.suggestions.length - 1 && (this.selected_suggestion = this.suggestions.length - 1);
    }
  };
}
function g({ key: e, statePath: n, columns: h, perPage: l, wire: s, displayValueKey: i }) {
  return {
    previous_value: null,
    showTable: !1,
    tableData: {
      results: [],
      total: 0,
      perPage: l,
      page: 1
    },
    selectedIndex: 0,
    sortColumn: null,
    sortDirection: "asc",
    pageInput: "",
    isLoading: !1,
    // Use entanglement for proper Livewire sync
    init() {
      this._entangled = s.entangle(n);
      const t = u(this._entangled, i);
      this.value = t, this.previous_value = t, this.$watch("_entangled", (a) => {
        this.value = u(a, i);
      });
    },
    get value() {
      return this._displayValue ?? "";
    },
    set value(t) {
      this._displayValue = t;
    },
    refresh_table() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.tableData = { results: [], total: 0, perPage: l, page: 1 }, this.showTable = !1, this.previous_value = null;
          return;
        }
        this.previous_value = this.value, this.tableData.page = 1, this.selectedIndex = 0, this.pageInput = "", this.loadData();
      }
    },
    loadData() {
      this.isLoading = !0, this.showTable = !0, s.callSchemaComponentMethod(e, "getPaginatedSearchResultsForJs", {
        search: this.value,
        page: this.tableData.page,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection
      }).then((t) => {
        this.tableData = t, this.isLoading = !1, this.selectedIndex >= t.results.length && (this.selectedIndex = Math.max(0, t.results.length - 1));
      });
    },
    sortBy(t) {
      this.sortColumn === t ? this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc" : (this.sortColumn = t, this.sortDirection = "asc"), this.loadData();
    },
    nextPage() {
      const t = Math.ceil(this.tableData.total / this.tableData.perPage);
      this.tableData.page < t && (this.tableData.page++, this.selectedIndex = 0, this.pageInput = "", this.loadData());
    },
    prevPage() {
      this.tableData.page > 1 && (this.tableData.page--, this.selectedIndex = 0, this.pageInput = "", this.loadData());
    },
    goToPageFromInput() {
      const t = parseInt(this.pageInput);
      if (!t || isNaN(t)) {
        this.pageInput = "";
        return;
      }
      const a = Math.ceil(this.tableData.total / this.tableData.perPage), o = Math.max(1, Math.min(t, a));
      this.tableData.page = o, this.selectedIndex = 0, this.pageInput = "", this.loadData();
    },
    selectItem(t) {
      if (!t) return;
      const a = u(t, i);
      this.value = a, this._entangled = a, this.showTable = !1, s.callSchemaComponentMethod(e, "reactOnItemSelectedFromJs", { item: t });
    },
    selectCurrentOrFirst() {
      if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
        const t = this.tableData.results[this.selectedIndex];
        this.selectItem(t);
      }
    },
    handleAction(t, a) {
      s.callSchemaComponentMethod(e, "reactOnRowActionFromJs", {
        item: t,
        action: a
      });
    },
    nextIndex() {
      this.selectedIndex++, this.selectedIndex >= this.tableData.results.length && (this.selectedIndex = this.tableData.results.length - 1);
    },
    prevIndex() {
      this.selectedIndex--, this.selectedIndex < 0 && (this.selectedIndex = 0);
    }
  };
}
export {
  c as default
};
//# sourceMappingURL=filament-searchable-input.js.map
