<!--
  @컴포넌트: 점검 폼
  @위치: 위젯 컴포넌트
  @설명: 점검 항목 입력 폼 - 상태 선택 및 비고 입력
-->
<template>
  <div>
    <div :class="containerClass">
      <div class="px-4 py-3 space-y-3">
        <InspectorSearch
          :value="inspectors"
          :list="inspectorsList"
          :label="$t('routineCheck.inspector')"
          @input="inspectors = $event"
        />

        <div class="flex items-center">
          <span class="text-sm text-gray-600 w-16 flex-shrink-0">
            {{ $t('routineCheck.processTime') }}
          </span>
          <div class="flex-1 flex items-center space-x-2">
            <input
              :value="startTime"
              type="text"
              readonly
              class="w-20 px-1 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="openTimePicker('start')"
            />
            <span class="text-gray-400">~</span>
            <input
              :value="endTime"
              type="text"
              readonly
              class="w-20 px-1 py-1.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              @click="openTimePicker('end')"
            />
          </div>
        </div>

        <div class="border-t border-gray-100 pt-3">
          <label class="text-sm text-gray-600 block mb-2">조치한사항 / 조치사항</label>
          <textarea
            v-model="content"
            placeholder="내용을 입력해주세요"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        <BottomActions
          v-if="isFormValid"
          primary-text="저장"
          secondary-text="취소"
          @primary-click="submitInspection"
          @secondary-click="cancelInspection"
        />
        <BottomActions
          v-else
          :show-secondary="false"
          primary-text="점검자를 선택해주세요"
          :disabled="true"
        />
      </div>
    </div>
    <TimePickerBottomSheet
      :value="startTime"
      :visible.sync="showStartPicker"
      title="시작 시간"
      @input="startTime = $event"
    />
    <TimePickerBottomSheet
      :value="endTime"
      :visible.sync="showEndPicker"
      title="종료 시간"
      @input="endTime = $event"
    />
  </div>
</template>

<script>
import BottomActions from '@/components/widgets/detail/post/common/BottomActions.vue'
import TimePickerBottomSheet from '@/components/common/TimePickerBottomSheet.vue'
import InspectorSearch from '@/components/widgets/detail/post/common/InspectorSearch.vue'

export default {
  name: 'InspectionForm',
  components: {
    BottomActions,
    TimePickerBottomSheet,
    InspectorSearch
  },
  props: {
    embedded: {
      type: Boolean,
      default: false
    },
    inspectorsList: {
      type: Array,
      required: true
    }
  },
  data: function () {
    return {
      inspectors: [],
      startTime: '14:00',
      endTime: '14:40',
      showStartPicker: false,
      showEndPicker: false,
      content: ''
    }
  },
  computed: {
    containerClass: function () {
      if (this.embedded) {
        return 'bg-white'
      }
      return 'bg-white border-t border-gray-200 shadow-lg'
    },
    isFormValid: function () {
      return (
        this.inspectors.length > 0 &&
        this.startTime &&
        this.endTime
      )
    }
  },
  methods: {
    openTimePicker: function (type) {
      if (type === 'start') {
        this.showStartPicker = true
      } else {
        this.showEndPicker = true
      }
    },
    buildPayload: function () {
      return {
        inspectors: this.inspectors,
        startTime: this.startTime,
        endTime: this.endTime,
        content: this.content
      }
    },
    submitInspection: function () {
      this.$emit('submit', this.buildPayload())
    },
    cancelInspection: function () {
      this.inspectors = []
      this.content = ''
      this.$emit('cancel')
    }
  }
}
</script>
