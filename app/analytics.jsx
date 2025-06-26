import { FontAwesome } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AnalyticsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <View style={styles.header}>
                    <Text style={styles.title}>Analytics</Text>
                    <Text style={styles.subtitle}>Your activity overview</Text>
                </View>

                <View style={styles.statsContainer}>
                    <StatCard
                        icon="line-chart"
                        title="Activity"
                        value="85%"
                        subtitle="Weekly progress"
                    />
                    <StatCard
                        icon="calendar"
                        title="Sessions"
                        value="12"
                        subtitle="This week"
                    />
                    <StatCard
                        icon="clock-o"
                        title="Time"
                        value="5.2h"
                        subtitle="Average daily"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityList}>
                        <ActivityItem
                            title="Completed Task"
                            subtitle="2 hours ago"
                            icon="check-circle"
                        />
                        <ActivityItem
                            title="New Milestone"
                            subtitle="Yesterday"
                            icon="trophy"
                        />
                        <ActivityItem
                            title="Goal Achieved"
                            subtitle="2 days ago"
                            icon="star"
                        />
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function StatCard({ icon, title, value, subtitle }) {
    return (
        <View style={styles.statCard}>
            <FontAwesome name={icon} size={24} color="#007AFF" />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
            <Text style={styles.statSubtitle}>{subtitle}</Text>
        </View>
    );
}

function ActivityItem({ title, subtitle, icon }) {
    return (
        <View style={styles.activityItem}>
            <FontAwesome name={icon} size={24} color="#007AFF" />
            <View style={styles.activityText}>
                <Text style={styles.activityTitle}>{title}</Text>
                <Text style={styles.activitySubtitle}>{subtitle}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    scrollView: {
        flex: 1,
    },
    header: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
    },
    statCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        width: '30%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 10,
    },
    statTitle: {
        fontSize: 14,
        marginTop: 5,
    },
    statSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 3,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    activityList: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 10,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    activityText: {
        marginLeft: 15,
    },
    activityTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    activitySubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
}); 