// noinspection JSUnusedGlobalSymbols,JSUnresolvedReference

export default function searchableInput({key, statePath, tableMode = false, columns = [], perPage = 10, wire, initialValue}) {
    if (tableMode) {
        return tableInput({key, statePath, columns, perPage, wire, initialValue})
    }
    return listInput({key, statePath, wire, initialValue})
}

function listInput({key, statePath, wire, initialValue}) {
    return {
        previous_value: null,
        value: initialValue,
        suggestions: [],
        selected_suggestion: 0,

        refresh_suggestions() {
            if (this.value === this.previous_value) {
                return
            }

            if (!this.value) {
                this.suggestions = []
                this.previous_value = null
                return
            }

            this.previous_value = this.value

            wire.callSchemaComponentMethod(key, 'getSearchResultsForJs', { search: this.value })
                .then(response => {
                    this.suggestions = response
                    this.selected_suggestion = 0
                })
        },

        set(item) {
            if (item === undefined) {
                return
            }

            this.value = item.value
            this.suggestions = []

            wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
        },

        previous_suggestion() {
            this.selected_suggestion--

            if (this.selected_suggestion < 0) {
                this.selected_suggestion = 0
            }
        },

        next_suggestion() {
            this.selected_suggestion++

            if (this.selected_suggestion > this.suggestions.length - 1) {
                this.selected_suggestion = this.suggestions.length - 1
            }
        },
    }
}

function tableInput({key, statePath, columns, perPage, wire, initialValue}) {
    return {
        previous_value: null,
        value: initialValue,
        showTable: false,
        tableData: {
            results: [],
            total: 0,
            perPage: perPage,
            page: 1,
        },
        selectedIndex: 0,
        sortColumn: null,
        sortDirection: 'asc',
        pageInput: '',
        isLoading: false,

        refresh_table() {
            if (this.value === this.previous_value) {
                return
            }

            if (!this.value) {
                this.tableData = { results: [], total: 0, perPage: perPage, page: 1 }
                this.showTable = false
                this.previous_value = null
                return
            }

            this.previous_value = this.value
            this.tableData.page = 1
            this.selectedIndex = 0
            this.pageInput = ''
            this.loadData()
        },

        loadData() {
            this.isLoading = true
            this.showTable = true

            wire.callSchemaComponentMethod(key, 'getPaginatedSearchResultsForJs', {
                search: this.value,
                page: this.tableData.page,
                sortColumn: this.sortColumn,
                sortDirection: this.sortDirection,
            }).then(response => {
                this.tableData = response
                this.isLoading = false

                if (this.selectedIndex >= response.results.length) {
                    this.selectedIndex = Math.max(0, response.results.length - 1)
                }
            })
        },

        sortBy(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
            } else {
                this.sortColumn = column
                this.sortDirection = 'asc'
            }
            this.loadData()
        },

        nextPage() {
            const totalPages = Math.ceil(this.tableData.total / this.tableData.perPage)
            if (this.tableData.page < totalPages) {
                this.tableData.page++
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        prevPage() {
            if (this.tableData.page > 1) {
                this.tableData.page--
                this.selectedIndex = 0
                this.pageInput = ''
                this.loadData()
            }
        },

        goToPageFromInput() {
            const pageNum = parseInt(this.pageInput)
            if (!pageNum || isNaN(pageNum)) {
                this.pageInput = ''
                return
            }

            const totalPages = Math.ceil(this.tableData.total / this.tableData.perPage)
            const targetPage = Math.max(1, Math.min(pageNum, totalPages))

            this.tableData.page = targetPage
            this.selectedIndex = 0
            this.pageInput = ''
            this.loadData()
        },

        selectItem(item) {
            if (!item) return

            this.value = item.value
            this.showTable = false

            wire.callSchemaComponentMethod(key, 'reactOnItemSelectedFromJs', { item: item })
        },

        selectCurrentOrFirst() {
            if (this.tableData.results.length > 0 && this.selectedIndex >= 0) {
                const item = this.tableData.results[this.selectedIndex]
                this.selectItem(item)
            }
        },

        handleAction(item, action) {
            wire.callSchemaComponentMethod(key, 'reactOnRowActionFromJs', {
                item: item,
                action: action,
            })
        },

        nextIndex() {
            this.selectedIndex++
            if (this.selectedIndex >= this.tableData.results.length) {
                this.selectedIndex = this.tableData.results.length - 1
            }
        },

        prevIndex() {
            this.selectedIndex--
            if (this.selectedIndex < 0) {
                this.selectedIndex = 0
            }
        },
    }
}
