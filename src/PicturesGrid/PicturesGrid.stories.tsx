import { Story } from '@storybook/react';
import { Meta } from '@storybook/react/types-6-0';
import React from 'react';
import PicturesGrid from './PicturesGrid';
import { ItemsProps } from './types';
export default {
	title: 'Components/PicturesGrid',
	component: PicturesGrid,
	argTypes: {
		items: {
			control: { type: 'object' },
		},
		transition: {
			options: [
				'linear',
				'easeIn',
				'easeOut',
				'easeInOut',
				'circIn',
				'circOut',
				'circInOut',
				'backIn',
				'backOut',
				'backInOut',
				'anticipate',
			],
			control: { type: 'select' },
		},
		duration: { control: { type: 'number' } },
		timeOut: { control: { type: 'number' } },
	},
} as Meta;

const Template: Story<ItemsProps> = (args) => <PicturesGrid {...args} />;

export const PicturesGridComponent = Template.bind({});

const portfolios: Array<any> = [
	{
		img: 'https://pm1.narvii.com/7119/c2086e54dd9db93f0be4846c6962a28786ab94b5r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/c88f3838ad0470ebdd91b9dcb5d26c2628b999f9r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/15818fe1e78d21d713be11859d5840513573eccfr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/ca437463a52eb4294047a3cfa1cc88e3304d11abr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/0f18ab7a1f959170639dfbf76eb519e707608e36r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/2f5e3f7b3deedaba97c5cbf8d632d72e82740a89r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/8e372b2d001bb84ad99f14dc357247bb107d704fr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/7dba89604f10e205db66961ef76e53064b38137ar1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/5f24e06e4a842bdd77f5563b2474ff732f45078ar1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/fe6af141c5535c034cf9708a7e5cb88f0a81a2a2r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/bdb334011549cc3c24f666fba77a768bb76346ecr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/ec1a8fd1524c71f0b7e707d7182140dc197df303r1-261-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/c2086e54dd9db93f0be4846c6962a28786ab94b5r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/c88f3838ad0470ebdd91b9dcb5d26c2628b999f9r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/15818fe1e78d21d713be11859d5840513573eccfr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/ca437463a52eb4294047a3cfa1cc88e3304d11abr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/0f18ab7a1f959170639dfbf76eb519e707608e36r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/2f5e3f7b3deedaba97c5cbf8d632d72e82740a89r1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/8e372b2d001bb84ad99f14dc357247bb107d704fr1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/7dba89604f10e205db66961ef76e53064b38137ar1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/5f24e06e4a842bdd77f5563b2474ff732f45078ar1-260-260v2_hq.jpg',
	},
	{
		img: 'https://pm1.narvii.com/7119/fe6af141c5535c034cf9708a7e5cb88f0a81a2a2r1-260-260v2_hq.jpg',
	},
];

PicturesGridComponent.args = {
	items: portfolios,
	transition: 'backOut',
	duration: 350,
	timeoOut: 0.5,
};
