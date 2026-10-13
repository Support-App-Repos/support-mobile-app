/**
 * Product purchase confirmed — mirrors EventBookingConfirmedScreen
 */

import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SuccessIcon } from '../../components/common';
import type { RootStackParamList } from '../../types';
import { formatListingPriceWithType } from '../../utils/currency';

const C = {
  screen: '#F2F2F2',
  white: '#FFFFFF',
  title: '#131218',
  subtitle: '#696971',
  primary: '#1B4F72',
  cta: '#27AE60',
  chipBorder: '#E8E8ED',
};

type ProductPaymentConfirmedScreenProps = {
  navigation?: any;
  route?: {
    params?: RootStackParamList['ProductPaymentConfirmed'];
  };
};

export const ProductPaymentConfirmedScreen: React.FC<
  ProductPaymentConfirmedScreenProps
> = ({ navigation, route }) => {
  const params = route?.params;
  const orderId = params?.orderId;
  const productTitle = params?.productTitle || 'Product';
  const quantity = params?.quantity ?? 1;
  const amount = params?.amount ?? 0;
  const currency = params?.currency ?? null;
  const status = params?.status || 'Paid';

  const totalPrice = formatListingPriceWithType(amount, currency, null);

  const handleGoHome = () => {
    navigation?.navigate('Home');
  };

  if (!orderId) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.state}>
          <Text style={styles.errorTitle}>Unable to continue</Text>
          <Text style={styles.stateText}>Order details are missing.</Text>
          <TouchableOpacity style={styles.doneBtn} onPress={handleGoHome} activeOpacity={0.86}>
            <Text style={styles.doneBtnText}>Go to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <SuccessIcon size={78} />
          <Text style={styles.heroTitle}>Payment Confirmed</Text>
          <Text style={styles.heroText}>
            Your product purchase was successful. We saved your order details for this
            payment.
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Product</Text>
            <Text style={styles.summaryValue}>{productTitle}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Quantity</Text>
            <Text style={styles.summaryValue}>{quantity}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>{status}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Order ID</Text>
            <Text style={styles.summaryValue}>{orderId}</Text>
          </View>
        </View>

        <View style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={styles.grandTotalLabel}>Total Paid</Text>
            <Text style={styles.grandTotalValue}>{totalPrice}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.doneBtn} onPress={handleGoHome} activeOpacity={0.86}>
          <Text style={styles.doneBtnText}>Go to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.screen,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 28,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  heroTitle: {
    marginTop: 12,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
    color: C.title,
    textAlign: 'center',
  },
  heroText: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
    textAlign: 'center',
  },
  summaryCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: C.title,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 20,
    color: C.subtitle,
  },
  summaryValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: C.title,
  },
  totalCard: {
    padding: 16,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.chipBorder,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  grandTotalLabel: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: C.title,
  },
  grandTotalValue: {
    fontSize: 17,
    lineHeight: 24,
    fontWeight: '900',
    color: C.primary,
  },
  footer: {
    padding: 16,
    backgroundColor: C.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.chipBorder,
  },
  doneBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.cta,
  },
  doneBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '800',
    color: C.white,
  },
  state: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 10,
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 21,
    color: C.subtitle,
  },
  errorTitle: {
    fontSize: 18,
    lineHeight: 27,
    fontWeight: '700',
    color: C.title,
  },
});
