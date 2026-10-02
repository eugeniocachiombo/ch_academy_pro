<script setup lang="ts">
import WelcomeBanner from '@/components/dashboard/WelcomeBanner.vue'
import MetricCards from '@/components/dashboard/MetricCards.vue'
import AcademicCalendar from '@/components/dashboard/AcademicCalendar.vue'
import PerformanceChart from '@/components/dashboard/PerformanceChart.vue'
import NoticesCard from '@/components/dashboard/NoticesCard.vue'
import UpcomingClasses from '@/components/dashboard/UpcomingClasses.vue'
import TopStudents from '@/components/dashboard/TopStudents.vue'
</script>

<template>
  <div class="space-y-6">
    <WelcomeBanner />
    <MetricCards />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <AcademicCalendar />
      <PerformanceChart />
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <NoticesCard />
      <UpcomingClasses />
      <TopStudents />
    </div>
  </div>
</template>
