import {AfterViewInit, Component, ElementRef, OnDestroy, ViewChild} from '@angular/core';
import {AnalyticsService} from '../shared/services/analytics.service';
import {AnalyticsPage, Filter, Order} from '../shared/interfaces';
import {Chart} from 'chart.js';
import {Subscription} from 'rxjs';
import {OrdersService} from '../shared/services/orders.service';
import * as moment from 'moment';

@Component({
  selector: 'app-analytics-page',
  templateUrl: './analytics-page.component.html',
  styleUrls: ['./analytics-page.component.css']
})
export class AnalyticsPageComponent implements AfterViewInit, OnDestroy {

  @ViewChild('gain') gainRef: ElementRef;
  @ViewChild('order') orderRef: ElementRef;
  @ViewChild('orders') ordersRef: ElementRef;

  aSub: Subscription;
  bSub: Subscription;
  average: number;
  pending = true;
  filter: Filter = {};
  orders: Order[] = [];

  constructor(private service: AnalyticsService, private ordersService: OrdersService) {
  }

  ngAfterViewInit() {
    const gainConfig: any = {
      label: 'Выручка',
      color: 'rgb(255, 99, 132)'
    };

    const orderConfig: any = {
      label: 'Заказы',
      color: 'rgb(54, 162, 235)'
    };

    const ordersConfig: any = {
      label: '',
      color: 'rgb(78,235,54)'
    };

    const params = Object.assign({}, this.filter, {
      offset: 0,
      limit: 100000
    });

    this.bSub = this.ordersService.fetch(params).subscribe(orders => {
      this.orders = this.orders.concat(orders);
      ordersConfig.labels = orders.map(item => moment(item.date).format('DD-MM-YYYY'));
      ordersConfig.data = orders.map((item) => {
        if (item.list.length > 1 ) {
          return item.list.reduce((acc, current) => acc + current.quantity, 0);
        } else {
          return item.list[0].quantity;
        }
      });

      const ordersCtx = this.ordersRef.nativeElement.getContext('2d');
      ordersCtx.canvas.height = '300px';
      new Chart(ordersCtx, createPieConfig(ordersConfig));

      this.pending = false;
    });

    this.aSub = this.service.getAnalytics().subscribe((data: AnalyticsPage) => {
      this.average = data.average;

      gainConfig.labels = data.chart.map(item => item.label);
      gainConfig.data = data.chart.map(item => item.gain);

      orderConfig.labels = data.chart.map(item => item.label);
      orderConfig.data = data.chart.map(item => item.order);

      ordersConfig.labels = data.chart.map(item => item.label);
      ordersConfig.data = data.chart.map(item => item.order);

      // **** Gain ****
      // gainConfig.labels.push('08.05.2018')
      // gainConfig.labels.push('09.05.2018')
      // gainConfig.data.push(1500)
      // gainConfig.data.push(700)
      // **** /Gain ****

      // **** Order ****
      // orderConfig.labels.push('08.05.2018')
      // orderConfig.labels.push('09.05.2018')
      // orderConfig.data.push(8)
      // orderConfig.data.push(2)
      // **** /Order ****

      const gainCtx = this.gainRef.nativeElement.getContext('2d');
      const orderCtx = this.orderRef.nativeElement.getContext('2d');

      gainCtx.canvas.height = '300px';
      orderCtx.canvas.height = '300px';

      new Chart (gainCtx, createChartConfig(gainConfig));
      new Chart(orderCtx, createChartConfig(orderConfig));

      this.pending = false;
    });
  }

  ngOnDestroy() {
    if (this.aSub) {
      this.aSub.unsubscribe();
    }
  }

}


function createChartConfig({labels, data, label, color}) {
  return {
    type: 'line',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          label, data,
          borderColor: color,
          steppedLine: false,
          fill: true,
          tension: 0.5,
          pointBorderWidth: 5,
        }
      ]
    }
  };
}


function createPieConfig({labels, data, label, color}) {
  return {
    type: 'pie',
    options: {
      responsive: true
    },
    data: {
      labels,
      datasets: [
        {
          label,
          data,
          backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(86,255,89)',
            'rgb(249,86,255)',
            'rgb(123,86,255)',
            'rgb(255,247,86)',
          ],
          hoverOffset: 4
        }
      ]
    }
  };
}
