<!--
  @컴포넌트: 점검자 검색
  @위치: 상세 위젯
  @설명: 점검자 선택 필드 (검색 모달 포함)
-->
<template>
  <div>
    <label v-if="label" class="text-[11px] text-gray-500 mb-0.5 block">{{ label }}</label>
    <div
      class="flex items-center justify-between px-2.5 py-1.5 border border-gray-200 rounded-md bg-white cursor-pointer hover:border-gray-300"
      @click="openSearch"
    >
      <span :class="displayValue ? 'text-xs text-gray-900' : 'text-xs text-gray-400'">
        {{ displayValue || placeholder }}
      </span>
      <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>

    <BottomSheet
      :visible.sync="showModal"
      title="작업자 검색"
      confirm-text="선택완료"
      bottom-padding="pb-0"
      @confirm="confirm"
    >
      <div class="px-3 py-3">
        <div class="relative mb-3">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="성함을 입력해주세요."
            class="w-full pl-3 pr-8 py-2 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-500"
          />
          <svg
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div class="space-y-1 max-h-56 overflow-y-auto">
          <div
            v-for="person in filteredList"
            :key="person.id"
            class="flex items-center justify-between py-2 border-b border-gray-100 cursor-pointer hover:bg-gray-50"
            @click="togglePerson(person)"
          >
            <div>
              <p class="text-[10px] text-gray-500">{{ person.department }}</p>
              <p class="text-xs font-medium text-blue-600">{{ person.name }}</p>
            </div>
            <svg
              v-if="isSelected(person.id)"
              class="w-4 h-4 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
    </BottomSheet>
  </div>
</template>

<script>
import BottomSheet from '@/components/common/BottomSheet.vue'

export default {
  name: 'InspectorSearch',
  components: {
    BottomSheet
  },
  props: {
    value: {
      type: [String, Array],
      default: function () {
        return []
      }
    },
    label: {
      type: String,
      default: '점검자'
    },
    placeholder: {
      type: String,
      default: '점검자 선택'
    },
    list: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      showModal: false,
      searchQuery: '',
      selectedIds: []
    }
  },
  computed: {
    filteredList: function () {
      var query = this.searchQuery.trim().toLowerCase()
      if (!query) return this.list
      return this.list.filter(function (person) {
        return person.name.toLowerCase().indexOf(query) > -1
      })
    },
    displayValue: function () {
      if (Array.isArray(this.value)) {
        return this.value.join(', ')
      }
      return this.value
    }
  },
  methods: {
    openSearch: function () {
      this.showModal = true
      this.searchQuery = ''
      this.syncSelectedFromValue()
    },
    syncSelectedFromValue: function () {
      if (Array.isArray(this.value)) {
        var names = this.value
        this.selectedIds = this.list
          .filter(function (person) {
            return names.indexOf(person.name) > -1
          })
          .map(function (person) {
            return person.id
          })
      } else if (this.value) {
        var selected = this.list.find(function (person) {
          return person.name === this.value
        }, this)
        this.selectedIds = selected ? [selected.id] : []
      } else {
        this.selectedIds = []
      }
    },
    isSelected: function (id) {
      return this.selectedIds.indexOf(id) > -1
    },
    togglePerson: function (person) {
      var index = this.selectedIds.indexOf(person.id)
      if (index > -1) {
        this.selectedIds.splice(index, 1)
      } else {
        this.selectedIds.push(person.id)
      }
      this.emitSelection()
    },
    emitSelection: function () {
      var selectedList = this.list.filter(function (p) {
        return this.selectedIds.indexOf(p.id) > -1
      }, this)
      var names = selectedList.map(function (p) {
        return p.name
      })
      this.$emit('input', names)
      this.$emit('select', selectedList)
    },
    confirm: function () {
      this.emitSelection()
      this.showModal = false
    }
  }
}
</script>
