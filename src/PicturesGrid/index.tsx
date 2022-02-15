import sync from 'framesync';
import {
	animate,
	anticipate,
	backIn,
	backInOut,
	backOut,
	circIn,
	circInOut,
	circOut,
	easeIn,
	easeInOut,
	easeOut,
	linear,
} from 'popmotion';
import React, { useEffect, useRef } from 'react';
import './picturesGrid.scss';
import {
	ChildCoordinates,
	Coords,
	ItemCachePosition,
	ItemsProps,
	PositionCoordinates,
	Positions,
	Transition,
} from './types';
const popmotionEasing: Transition = {
	anticipate,
	backIn,
	backInOut,
	backOut,
	circIn,
	circInOut,
	circOut,
	easeIn,
	easeInOut,
	easeOut,
	linear,
};

const DATASET_KEY = 'elegantPictureBoxId';
const itemCachePosition: ItemCachePosition = {};

const toArray = (arrLike: ArrayLike<any>): any[] => {
	if (!arrLike) return [];
	return Array.prototype.slice.call(arrLike);
};

const getCurrentPositionChildElement = (
	gridBoundingClientRect: PositionCoordinates,
	el: HTMLElement
) => {
	const { top, left, width, height } = el.getBoundingClientRect();
	const rect = { top, left, width, height };
	rect.top -= gridBoundingClientRect.top;
	rect.left -= gridBoundingClientRect.left;
	// if an element is display:none it will return top: 0 and left:0
	// rather than saying it's still in the containing element
	// so we need to use Math.max to make sure the coordinates stay
	// within the container
	rect.top = Math.max(rect.top, 0);
	rect.left = Math.max(rect.left, 0);

	return rect;
};

const applyTransform = (
	el: HTMLElement,
	{ translateX, translateY, scaleX, scaleY }: Coords,
	{ immediate }: { immediate?: boolean } = {}
) => {
	const isFinished = translateX === 0 && translateY === 0 && scaleX === 1 && scaleY === 1;

	const styleEl = () => {
		el.style.transform = isFinished
			? ''
			: `translateX(${translateX}px) translateY(${translateY}px) scaleX(${scaleX}) scaleY(${scaleY})`;
	};
	if (immediate) styleEl();
	else sync.render(styleEl);

	const firstChild = el.children[0] as HTMLElement;

	if (firstChild) {
		const styleChild = () => {
			firstChild.style.transform = isFinished ? '' : `scaleX(${1 / scaleX}) scaleY(${1 / scaleY})`;
		};

		if (immediate) styleChild();
		else sync.render(styleChild);
	}
};

const registerPositions = (
	gridBoundingClientRect: PositionCoordinates,
	elements: HTMLCollectionOf<HTMLElement> | HTMLElement[]
) => {
	const childrenElements = toArray(elements);
	childrenElements.forEach((el) => {
		if (typeof el.getBoundingClientRect !== 'function') return;

		//agregar propiedad data-aniamted-grid-id con un ID
		if (!el.dataset[DATASET_KEY]) el.dataset[DATASET_KEY] = `${Math.random()}`;

		const animatedGridId = el.dataset[DATASET_KEY] as string;

		if (!itemCachePosition[animatedGridId]) itemCachePosition[animatedGridId] = {} as Positions;

		const currentPositionChildElement = getCurrentPositionChildElement(gridBoundingClientRect, el);

		itemCachePosition[animatedGridId].childElement = currentPositionChildElement;
		itemCachePosition[animatedGridId].parentElement = gridBoundingClientRect;
	});
};

const stopCurrentTransitions = (container: HTMLElement) => {
	const childrenElements = toArray(container.children) as HTMLElement[];
	childrenElements.filter((el) => {
		const position = itemCachePosition[el.dataset[DATASET_KEY] as string];
		if (position && position.stop) {
			position.stop();
			delete position.stop;
			return true;
		}
	});
	childrenElements.forEach((el) => {
		el.style.transform = '';
		const firstChild = el.children[0] as HTMLElement;
		if (firstChild) firstChild.style.transform = '';
	});

	return childrenElements;
};

const getNewPositions = (
	gridBoundingClientRect: PositionCoordinates,
	childrenElements: HTMLElement[]
) => {
	const positionGridChildren = childrenElements.map((el) => ({
		childCoords: {} as ChildCoordinates,
		el,
		currentPositionChildElement: getCurrentPositionChildElement(gridBoundingClientRect, el),
	}));

	positionGridChildren.filter(({ el, currentPositionChildElement }) => {
		const position = itemCachePosition[el.dataset[DATASET_KEY] as string];

		if (!position) {
			registerPositions(currentPositionChildElement, [el]);
			return false;
		} else if (
			gridBoundingClientRect.top === position.childElement.top &&
			gridBoundingClientRect.left === position.childElement.left &&
			gridBoundingClientRect.width === position.childElement.width &&
			gridBoundingClientRect.height === position.childElement.height
		) {
			// if it hasn't moved, dont animate it
			return false;
		}
		return true;
	});

	positionGridChildren.forEach(({ el }) => {
		if (toArray(el.children).length > 1) {
			throw new Error(
				'Make sure every grid item has a single container element surrounding its children'
			);
		}
	});

	if (!positionGridChildren.length) return;

	positionGridChildren
		// do this measurement first so as not to cause layout thrashing
		.map((data) => {
			const firstChild = data.el.children[0] as HTMLElement;

			if (firstChild)
				data.childCoords = getCurrentPositionChildElement(gridBoundingClientRect, firstChild);

			return data;
		});

	return positionGridChildren;
};

const startAnimation = (
	gridBoundingClientRect: PositionCoordinates,
	positionGridChildren: any,
	transition: keyof Transition,
	duration: number,
	timeOut: number
) => {
	positionGridChildren.forEach(
		(
			{
				el,
				currentPositionChildElement: { top, left, width, height },
				childCoords: { top: childTop, left: childLeft },
			},
			i
		) => {
			const firstChild = el.children[0] as HTMLElement;
			const position = itemCachePosition[el.dataset[DATASET_KEY] as string];
			const coords: Coords = {
				scaleX: position.childElement.width / width,
				scaleY: position.childElement.height / height,
				translateX: position.childElement.left - left,
				translateY: position.childElement.top - top,
			};

			el.style.transformOrigin = '0 0';

			if (firstChild) {
				firstChild.style.transformOrigin = '0 0';
				firstChild.style.transition = '10s';
			}

			applyTransform(el, coords, { immediate: true });

			if (!popmotionEasing[transition]) throw new Error(`${transition} is not a valid easing name`);

			const init = () => {
				const animation = animate({
					from: coords,
					to: { translateX: 0, translateY: 0, scaleX: 1, scaleY: 1 },
					duration: duration,
					ease: popmotionEasing[transition],
					onUpdate: (transforms: Coords) => {
						applyTransform(el, transforms);
						sync.postRender(() => registerPositions(gridBoundingClientRect, [el]));
					},
				});

				position.stop = () => animation.stop;
			};
			const timeoutId = setTimeout(() => {
				sync.update(init);
			}, timeOut * i);
			position.stop = () => clearTimeout(timeoutId);
		}
	);
};

const PicturesGrid = ({ items, transition, duration, timeOut }: ItemsProps) => {
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const grid: HTMLElement = gridRef.current;
		const gridsItemPosition: PositionCoordinates = grid.getBoundingClientRect();

		registerPositions(gridsItemPosition, grid.children as HTMLCollectionOf<HTMLElement>);

		const childrenElement = stopCurrentTransitions(grid);

		grid.addEventListener('click', (ev) => {
			let target = ev.target as any;

			if (target.tagName === 'IMG') {
				const elParent = target.parentElement['parentElement'];
				//target.parentElement.classList.toggle('zoom');
				elParent.classList.toggle('zoom');

				const newPositions = getNewPositions(gridsItemPosition, childrenElement);
				startAnimation(gridsItemPosition, newPositions, transition, duration, timeOut);

				return;
			}
		});
	});

	return (
		<div ref={gridRef} className='grid'>
			{items.map((item, index) => (
				<div className='card' key={index}>
					<div className='item'>
						<img src={item.img} alt={item.name} />
					</div>
				</div>
			))}
		</div>
	);
};

export default PicturesGrid;