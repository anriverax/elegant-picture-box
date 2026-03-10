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
import React, { useCallback, useEffect, useRef } from 'react';
import './picturesGrid.scss';
import {
	ChildCoordinates,
	Coords,
	ItemCachePosition,
	ItemsProps,
	PositionCoordinates,
	PositionGridChild,
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

const toArray = <T extends Element>(arrLike: ArrayLike<T>): T[] => {
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
	cache: ItemCachePosition,
	gridBoundingClientRect: PositionCoordinates,
	elements: HTMLCollectionOf<HTMLElement> | HTMLElement[]
) => {
	const childrenElements = toArray<HTMLElement>(elements as ArrayLike<HTMLElement>);
	childrenElements.forEach((el) => {
		if (typeof el.getBoundingClientRect !== 'function') return;

		if (!el.dataset[DATASET_KEY]) el.dataset[DATASET_KEY] = `${Math.random()}`;

		const animatedGridId = el.dataset[DATASET_KEY] as string;

		if (!cache[animatedGridId]) cache[animatedGridId] = {} as Positions;

		const currentPositionChildElement = getCurrentPositionChildElement(gridBoundingClientRect, el);

		cache[animatedGridId].childElement = currentPositionChildElement;
		cache[animatedGridId].parentElement = gridBoundingClientRect;
	});
};

const stopCurrentTransitions = (cache: ItemCachePosition, container: HTMLElement) => {
	const childrenElements = toArray<Element>(container.children).map((el) => el as HTMLElement);
	childrenElements.forEach((el) => {
		const position = cache[el.dataset[DATASET_KEY] as string];
		if (position && position.stop) {
			position.stop();
			delete position.stop;
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
	cache: ItemCachePosition,
	gridBoundingClientRect: PositionCoordinates,
	childrenElements: HTMLElement[]
): PositionGridChild[] | undefined => {
	const positionGridChildren: PositionGridChild[] = childrenElements.map((el) => ({
		childCoords: {} as ChildCoordinates,
		el,
		currentPositionChildElement: getCurrentPositionChildElement(gridBoundingClientRect, el),
	}));

	positionGridChildren.forEach(({ el, currentPositionChildElement }) => {
		const position = cache[el.dataset[DATASET_KEY] as string];

		if (!position) {
			registerPositions(cache, currentPositionChildElement, [el]);
		}
	});

	positionGridChildren.forEach(({ el }) => {
		if (toArray<Element>(el.children).length > 1) {
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
	cache: ItemCachePosition,
	gridBoundingClientRect: PositionCoordinates,
	positionGridChildren: PositionGridChild[],
	transition: keyof Transition,
	duration: number,
	timeOut: number
) => {
	positionGridChildren.forEach(
		(
			{
				el,
				currentPositionChildElement: { top, left, width, height },
			},
			i
		) => {
			const firstChild = el.children[0] as HTMLElement;
			const position = cache[el.dataset[DATASET_KEY] as string];
			const coords: Coords = {
				scaleX: position.childElement.width / width,
				scaleY: position.childElement.height / height,
				translateX: position.childElement.left - left,
				translateY: position.childElement.top - top,
			};

			el.style.transformOrigin = '0 0';

			if (firstChild) {
				firstChild.style.transformOrigin = '0 0';
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
						sync.postRender(() => registerPositions(cache, gridBoundingClientRect, [el]));
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
	const cacheRef = useRef<ItemCachePosition>({});

	const handleClick = useCallback(
		(ev: MouseEvent) => {
			const grid = gridRef.current;
			if (!grid) return;

			const target = ev.target as HTMLElement;

			if (target.tagName === 'IMG') {
				const elParent = target.parentElement?.parentElement;
				if (!elParent) return;

				elParent.classList.toggle('zoom');

				const cache = cacheRef.current;
				const gridsItemPosition: PositionCoordinates = grid.getBoundingClientRect();
				const childrenElement = stopCurrentTransitions(cache, grid);
				const newPositions = getNewPositions(cache, gridsItemPosition, childrenElement);
				if (newPositions) {
					startAnimation(cache, gridsItemPosition, newPositions, transition, duration, timeOut);
				}
			}
		},
		[transition, duration, timeOut]
	);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		const cache = cacheRef.current;
		const gridsItemPosition: PositionCoordinates = grid.getBoundingClientRect();

		registerPositions(cache, gridsItemPosition, grid.children as HTMLCollectionOf<HTMLElement>);

		const childrenElement = stopCurrentTransitions(cache, grid);

		const newPositions = getNewPositions(cache, gridsItemPosition, childrenElement);
		if (newPositions) {
			startAnimation(cache, gridsItemPosition, newPositions, transition, duration, timeOut);
		}

		grid.addEventListener('click', handleClick);

		return () => {
			grid.removeEventListener('click', handleClick);
		};
	}, [items, transition, duration, timeOut, handleClick]);

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