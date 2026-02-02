function g({ key: s, statePath: l, tableMode: i = !1, columns: a = [], perPage: e = 10, wire: h, initialValue: t }) {
  return i ? r({ key: s, statePath: l, columns: a, perPage: e, wire: h, initialValue: t }) : u({ key: s, statePath: l, wire: h, initialValue: t });
}
function u({ key: s, statePath: l, wire: i, initialValue: a }) {
  return {
    previous_value: null,
    value: a,
    suggestions: [],
    selected_suggestion: 0,
    refresh_suggestions() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.suggestions = [], this.previous_value = null;
          return;
        }
        this.previous_value = this.value, i.callSchemaComponentMethod(s, "getSearchResultsForJs", { search: this.value }).then((e) => {
          this.suggestions = e, this.selected_suggestion = 0;
        });
      }
    },
    set(e) {
      e !== void 0 && (this.value = e.value, this.suggestions = [], i.callSchemaComponentMethod(s, "reactOnItemSelectedFromJs", { item: e }));
    },
    previous_suggestion() {
      this.selected_suggestion--, this.selected_suggestion < 0 && (this.selected_suggestion = 0);
    },
    next_suggestion() {
      this.selected_suggestion++, this.selected_suggestion > this.suggestions.length - 1 && (this.selected_suggestion = this.suggestions.length - 1);
    }
  };
}
function r({ key: s, statePath: l, columns: i, perPage: a, wire: e, initialValue: h }) {
  return {
    previous_value: null,
    value: h,
    showTable: !1,
    tableData: {
      results: [],
      total: 0,
      perPage: a,
      page: 1
    },
    selectedIndex: 0,
    sortColumn: null,
    sortDirection: "asc",
    pageInput: "",
    isLoading: !1,
    refresh_table() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.tableData = { results: [], total: 0, perPage: a, page: 1 }, this.showTable = !1, this.previous_value = null;
          return;
        }
        this.previous_value = this.value, this.tableData.page = 1, this.selectedIndex = 0, this.pageInput = "", this.loadData();
      }
    },
    loadData() {
      this.isLoading = !0, this.showTable = !0, e.callSchemaComponentMethod(s, "getPaginatedSearchResultsForJs", {
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
      const n = Math.ceil(this.tableData.total / this.tableData.perPage), o = Math.max(1, Math.min(t, n));
      this.tableData.page = o, this.selectedIndex = 0, this.pageInput = "", this.loadData();
    },
    selectItem(t) {
      t && (this.value = t.value, this.showTable = !1, e.callSchemaComponentMethod(s, "reactOnItemSelectedFromJs", { item: t }));
    },
    selectCurrentOrFirst() {
      if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
        const t = this.tableData.results[this.selectedIndex];
        this.selectItem(t);
      }
    },
    handleAction(t, n) {
      e.callSchemaComponentMethod(s, "reactOnRowActionFromJs", {
        item: t,
        action: n
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
  g as default
};
//# sourceMappingURL=filament-searchable-input.js.map
