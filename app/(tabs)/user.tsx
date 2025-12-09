import { useApp } from '@/context/AppContext';
import { useTheme } from '@/hooks/use-theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
    Dimensions,
    Platform,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createStyles } from './styles/user.styles';

export default function TelemetryScreen() {
  const { state } = useApp();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  
  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 6); // Default: last 7 days
    date.setHours(0, 0, 0, 0);
    return date;
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setHours(23, 59, 59, 999);
    return date;
  });
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Calculate telemetry data
  const telemetryData = useMemo(() => {
    const totalTips = state.tipCalculations.reduce((sum, calc) => sum + calc.totalTipAmount, 0);
    const totalSurplus = state.tipCalculations.reduce((sum, calc) => sum + (calc.undistributedAmount || 0), 0);
    const totalCalculations = state.tipCalculations.length;
    const staffMembers = state.staff.length;

    // Calculate days in range
    const timeDiff = endDate.getTime() - startDate.getTime();
    const daysToShow = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    // Group calculations by date
    const calculationsByDate = new Map<string, { lunch: number; dinner: number; count: number }>();
    
    // Initialize all dates in range with zero values
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      calculationsByDate.set(dateKey, { lunch: 0, dinner: 0, count: 0 });
    }

    // Fill in actual data
    state.tipCalculations.forEach(calc => {
      const calcDate = new Date(calc.date);
      const dateKey = calcDate.toISOString().split('T')[0];
      
      if (calculationsByDate.has(dateKey)) {
        const existing = calculationsByDate.get(dateKey)!;
        if (calc.mealPeriod === 'lunch') {
          existing.lunch += calc.totalTipAmount;
        } else {
          existing.dinner += calc.totalTipAmount;
        }
        existing.count++;
      }
    });

    // Convert to array and sort by date
    const chartData = Array.from(calculationsByDate.entries())
      .map(([date, data]) => ({
        date: new Date(date),
        dateLabel: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        lunch: data.lunch,
        dinner: data.dinner,
        total: data.lunch + data.dinner,
        count: data.count,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Find max value for scaling
    const maxValue = Math.max(...chartData.map(d => Math.max(d.lunch, d.dinner)), 1);

    return {
      totalTips,
      totalSurplus,
      totalCalculations,
      staffMembers,
      chartData,
      maxValue,
    };
  }, [state.tipCalculations, state.staff, startDate, endDate]);

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  const handleStartDateChange = (event: any, date?: Date) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (date) {
      const newStartDate = new Date(date);
      newStartDate.setHours(0, 0, 0, 0);
      setStartDate(newStartDate);
      
      // Ensure end date is not before start date
      if (newStartDate > endDate) {
        const newEndDate = new Date(newStartDate);
        newEndDate.setHours(23, 59, 59, 999);
        setEndDate(newEndDate);
      }
    }
  };

  const handleEndDateChange = (event: any, date?: Date) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (date) {
      const newEndDate = new Date(date);
      newEndDate.setHours(23, 59, 59, 999);
      setEndDate(newEndDate);
      
      // Ensure start date is not after end date
      if (newEndDate < startDate) {
        const newStartDate = new Date(newEndDate);
        newStartDate.setHours(0, 0, 0, 0);
        setStartDate(newStartDate);
      }
    }
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const start = new Date();
    start.setDate(start.getDate() - days + 1);
    start.setHours(0, 0, 0, 0);
    setStartDate(start);
    setEndDate(end);
  };

  // Prepare chart data
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 40, telemetryData.chartData.length * 50);

  const lunchData = telemetryData.chartData.map(d => d.lunch);
  const dinnerData = telemetryData.chartData.map(d => d.dinner);
  const labels = telemetryData.chartData.map(d => d.dateLabel);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Telemetry</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(telemetryData.totalTips)}</Text>
            <Text style={styles.statLabel}>Total Tips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{formatCurrency(telemetryData.totalSurplus)}</Text>
            <Text style={styles.statLabel}>Total Surplus</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{telemetryData.staffMembers}</Text>
            <Text style={styles.statLabel}>Staff Members</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{telemetryData.totalCalculations}</Text>
            <Text style={styles.statLabel}>Calculations</Text>
          </View>
        </View>

        {/* Date Range Selector */}
        <View style={styles.dateRangeSection}>
          <Text style={styles.sectionTitle}>Date Range</Text>
          
          {/* Quick Range Buttons */}
          <View style={styles.quickRangeContainer}>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => setQuickRange(7)}
            >
              <Text style={styles.quickRangeText}>Last 7 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => setQuickRange(30)}
            >
              <Text style={styles.quickRangeText}>Last 30 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickRangeButton}
              onPress={() => setQuickRange(90)}
            >
              <Text style={styles.quickRangeText}>Last 90 Days</Text>
            </TouchableOpacity>
          </View>

          {/* Custom Date Pickers */}
          <View style={styles.customDateContainer}>
            <View style={styles.datePickerGroup}>
              <Text style={styles.datePickerLabel}>From</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.datePickerGroup}>
              <Text style={styles.datePickerLabel}>To</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.datePickerText}>
                  {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {showStartDatePicker && (
            <DateTimePicker
              value={startDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleStartDateChange}
              maximumDate={endDate}
            />
          )}
          {showEndDatePicker && (
            <DateTimePicker
              value={endDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleEndDateChange}
              minimumDate={startDate}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Chart Section */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Tips Overview</Text>
          <View style={styles.chartLegend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
              <Text style={styles.legendText}>Lunch</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary }]} />
              <Text style={styles.legendText}>Dinner</Text>
            </View>
          </View>

          {telemetryData.chartData.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No data available for selected range</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View>
                {/* Lunch Chart */}
                <Text style={styles.chartSubtitle}>🌞 Lunch Tips</Text>
                <LineChart
                  data={{
                    labels: labels,
                    datasets: [{
                      data: lunchData.length > 0 ? lunchData : [0],
                    }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => colors.primary,
                    labelColor: (opacity = 1) => colors.text,
                    style: {
                      borderRadius: 8,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: colors.primary,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: colors.border,
                      strokeWidth: 1,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                />

                {/* Dinner Chart */}
                <Text style={[styles.chartSubtitle, { marginTop: 24 }]}>🌙 Dinner Tips</Text>
                <LineChart
                  data={{
                    labels: labels,
                    datasets: [{
                      data: dinnerData.length > 0 ? dinnerData : [0],
                    }],
                  }}
                  width={chartWidth}
                  height={200}
                  chartConfig={{
                    backgroundColor: colors.card,
                    backgroundGradientFrom: colors.card,
                    backgroundGradientTo: colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => colors.secondary,
                    labelColor: (opacity = 1) => colors.text,
                    style: {
                      borderRadius: 8,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: colors.secondary,
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '',
                      stroke: colors.border,
                      strokeWidth: 1,
                    },
                  }}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withVerticalLabels={true}
                  withHorizontalLabels={true}
                  fromZero={true}
                />
              </View>
            </ScrollView>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {state.tipCalculations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No calculations yet</Text>
            </View>
          ) : (
            state.tipCalculations
              .slice()
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map((calc, index) => (
                <View key={calc.id} style={styles.activityItem}>
                  <View style={styles.activityInfo}>
                    <Text style={styles.activityDate}>
                      {new Date(calc.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text style={styles.activityMeal}>
                      {calc.mealPeriod === 'lunch' ? '🌞 Lunch' : '🌙 Dinner'}
                    </Text>
                  </View>
                  <Text style={styles.activityAmount}>
                    {formatCurrency(calc.totalTipAmount)}
                  </Text>
                </View>
              ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}