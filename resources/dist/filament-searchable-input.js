function u({ key: e, statePath: i, tableMode: s = !1, columns: a = [], perPage: t = 10 }) {
  return s ? o({ key: e, statePath: i, columns: a, perPage: t }) : h({ key: e, statePath: i });
}
function h({ key: e, statePath: i }) {
  return {
    previous_value: null,
    value: this.$wire.entangle(i),
    suggestions: [],
    selected_suggestion: 0,
    refresh_suggestions: function() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.suggestions = [], this.previous_value = null;
          return;
        }
        this.previous_value = this.value, this.$wire.callSchemaComponentMethod(e, "getSearchResultsForJs", { search: this.value }).then((s) => {
          this.suggestions = s, this.selected_suggestion = 0;
        });
      }
    },
    set: function(s) {
      s !== void 0 && (this.value = s.value, this.suggestions = [], this.$wire.callSchemaComponentMethod(e, "reactOnItemSelectedFromJs", { item: s }));
    },
    previous_suggestion() {
      this.selected_suggestion--, this.selected_suggestion < 0 && (this.selected_suggestion = 0);
    },
    next_suggestion() {
      this.selected_suggestion++, this.selected_suggestion > this.suggestions.length - 1 && (this.selected_suggestion = this.suggestions.length - 1);
    }
  };
}
function o({ key: e, statePath: i, columns: s, perPage: a }) {
  return {
    previous_value: null,
    value: this.$wire.entangle(i),
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
    refresh_table: function() {
      if (this.value !== this.previous_value) {
        if (!this.value) {
          this.tableData = { results: [], total: 0, perPage: a, page: 1 }, this.showTable = !1, this.previous_value = null;
          return;
        }
        this.previous_value = this.value, this.tableData.page = 1, this.selectedIndex = 0, this.pageInput = "", this.loadData();
      }
    },
    loadData: function() {
      this.isLoading = !0, this.showTable = !0, this.$wire.callSchemaComponentMethod(e, "getPaginatedSearchResultsForJs", {
        search: this.value,
        page: this.tableData.page,
        sortColumn: this.sortColumn,
        sortDirection: this.sortDirection
      }).then((t) => {
        this.tableData = t, this.isLoading = !1, this.selectedIndex >= t.results.length && (this.selectedIndex = Math.max(0, t.results.length - 1));
      });
    },
    sortBy: function(t) {
      this.sortColumn === t ? this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc" : (this.sortColumn = t, this.sortDirection = "asc"), this.loadData();
    },
    nextPage: function() {
      const t = Math.ceil(this.tableData.total / this.tableData.perPage);
      this.tableData.page < t && (this.tableData.page++, this.selectedIndex = 0, this.pageInput = "", this.loadData());
    },
    prevPage: function() {
      this.tableData.page > 1 && (this.tableData.page--, this.selectedIndex = 0, this.pageInput = "", this.loadData());
    },
    goToPageFromInput: function() {
      const t = parseInt(this.pageInput);
      if (!t || isNaN(t)) {
        this.pageInput = "";
        return;
      }
      const n = Math.ceil(this.tableData.total / this.tableData.perPage), l = Math.max(1, Math.min(t, n));
      this.tableData.page = l, this.selectedIndex = 0, this.pageInput = "", this.loadData();
    },
    selectItem: function(t) {
      t && (this.value = t.value, this.showTable = !1, this.$wire.callSchemaComponentMethod(e, "reactOnItemSelectedFromJs", { item: t }));
    },
    selectCurrentOrFirst: function() {
      if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
        const t = this.tableData.results[this.selectedIndex];
        this.selectItem(t);
      }
    },
    handleAction: function(t, n) {
      this.$wire.callSchemaComponentMethod(e, "reactOnRowActionFromJs", {
        item: t,
        action: n
      });
    },
    nextIndex: function() {
      this.selectedIndex++, this.selectedIndex >= this.tableData.results.length && (this.selectedIndex = this.tableData.results.length - 1);
    },
    prevIndex: function() {
      this.selectedIndex--, this.selectedIndex < 0 && (this.selectedIndex = 0);
    }
  };
}
export {
  u as default
};
//# sourceMappingURL=filament-searchable-input.js.map
